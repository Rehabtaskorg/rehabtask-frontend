"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { sendChatMessage, getChatErrorMessage } from "@/services/ai.api";
import { getGreeting } from "@/lib/aiChatConfig";
import { useLeadState } from "@/hooks/useLeadState";

const newSessionId = () =>
    typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : null;

export function useAiChat(audience, accountName) {
    const greeting = useMemo(() => getGreeting(audience, accountName), [audience, accountName]);
    const [messages, setMessages] = useState([greeting]);
    const [error, setError] = useState(null);
    const [failedText, setFailedText] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(null);

    const sessionIdRef = useRef(undefined);
    if (sessionIdRef.current === undefined) sessionIdRef.current = newSessionId();

    const conversationRef = useRef(0);
    const sendingRef = useRef(false);
    const handoverRef = useRef(false);
    const lead = useLeadState(setMessages);

    const send = useCallback(async (text) => {
        const content = text.trim();
        if (!content || sendingRef.current) return;

        sendingRef.current = true;
        const conversation = conversationRef.current;
        const next = [...messages, { role: "user", content }];

        setMessages(next);
        setError(null);
        setFailedText(null);
        setRetryAfterSeconds(null);
        setIsSending(true);

        let started = false;

        try {
            const { offerLead, handoverArranged } = await sendChatMessage({
                messages: next,
                sessionId: sessionIdRef.current,
                audience,
                handoverArranged: handoverRef.current,
                onChunk: (text) => {
                    if (conversationRef.current !== conversation) return;
                    if (!started && !text.trim()) return;

                    const isFirst = !started;
                    started = true;

                    setMessages((current) =>
                        isFirst
                            ? [...current, { role: "assistant", content: text }]
                            : current.map((m, i) =>
                                i === current.length - 1 ? { ...m, content: m.content + text } : m
                            )
                    );

                    if (isFirst) setIsSending(false);
                },
            });
            if (conversationRef.current !== conversation) return;
            handoverRef.current = Boolean(handoverArranged);
            if (offerLead) lead.markLeadOffered();
            else lead.dismissOffer();
        } catch (err) {
            if (conversationRef.current !== conversation) return;
            setMessages((current) => current.slice(0, started ? -2 : -1));
            setFailedText(content);
            setError(getChatErrorMessage(err));
            if (err?.isRateLimit) setRetryAfterSeconds(err.retryAfterSeconds ?? 60);
        } finally {
            if (conversationRef.current === conversation) {
                sendingRef.current = false;
                setIsSending(false);
            }
        }
    }, [messages, audience, lead.markLeadOffered, lead.dismissOffer]);

    const reset = useCallback(() => {
        conversationRef.current += 1;
        sendingRef.current = false;
        handoverRef.current = false;
        lead.resetLead();
        sessionIdRef.current = newSessionId();
        setMessages([greeting]);
        setError(null);
        setFailedText(null);
        setIsSending(false);
    }, [greeting, lead.resetLead]);

    return {
        messages,
        error,
        failedText,
        isSending,
        retryAfterSeconds,
        send,
        reset,
        ...lead,
    };
}
