"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { sendChatMessage, getChatErrorMessage } from "@/services/ai.api";
import { getGreeting } from "@/lib/aiChatConfig";

const newSessionId = () =>
    typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : null;

export function useAiChat(audience) {
    const greeting = useMemo(() => getGreeting(audience), [audience]);
    const [messages, setMessages] = useState([greeting]);
    const [error, setError] = useState(null);
    const [failedText, setFailedText] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(null);

    const sessionIdRef = useRef(undefined);
    if (sessionIdRef.current === undefined) sessionIdRef.current = newSessionId();

    const conversationRef = useRef(0);
    const sendingRef = useRef(false);
    const leadSentRef = useRef(false);

    const hasLeadCard = messages.some((m) => m.role === "lead");

    const openLead = useCallback(() => {
        if (leadSentRef.current) return;
        setMessages((current) =>
            current.some((m) => m.role === "lead") ? current : [...current, { role: "lead" }]
        );
    }, []);

    const dismissLead = useCallback(() => {
        setMessages((current) => current.filter((m) => m.role !== "lead"));
    }, []);

    const completeLead = useCallback((email) => {
        leadSentRef.current = true;
        setMessages((current) =>
            current.map((m) => (m.role === "lead" ? { role: "lead-sent", email } : m))
        );
    }, []);

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

        try {
            const { reply, offerLead } = await sendChatMessage({
                messages: next,
                sessionId: sessionIdRef.current,
                audience,
            });
            if (conversationRef.current !== conversation) return;
            setMessages((current) => [
                ...current,
                { role: "assistant", content: reply },
                ...(offerLead && !leadSentRef.current ? [{ role: "lead" }] : []),
            ]);
        } catch (err) {
            if (conversationRef.current !== conversation) return;
            setMessages((current) => current.slice(0, -1));
            setFailedText(content);
            setError(getChatErrorMessage(err));
            if (err?.isRateLimit) setRetryAfterSeconds(err.retryAfterSeconds ?? 60);
        } finally {
            if (conversationRef.current === conversation) {
                sendingRef.current = false;
                setIsSending(false);
            }
        }
    }, [messages, audience]);

    const reset = useCallback(() => {
        conversationRef.current += 1;
        sendingRef.current = false;
        leadSentRef.current = false;
        sessionIdRef.current = newSessionId();
        setMessages([greeting]);
        setError(null);
        setFailedText(null);
        setIsSending(false);
    }, [greeting]);

    return {
        messages,
        error,
        failedText,
        isSending,
        retryAfterSeconds,
        hasLeadCard,
        send,
        reset,
        openLead,
        dismissLead,
        completeLead,
    };
}
