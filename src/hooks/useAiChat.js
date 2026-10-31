"use client";

import { useCallback, useRef, useState } from "react";
import { sendChatMessage, getChatErrorMessage } from "@/services/ai.api";

const newSessionId = () =>
    typeof globalThis.crypto?.randomUUID === "function" ? globalThis.crypto.randomUUID() : null;

/**
 * @param {"public"|"customer"|"therapist"|"agency"} [audience] where the widget is mounted.
 *   The backend trusts the session over this value for signed-in users.
 * @returns {{
 *   messages: Array<{role: "user"|"assistant", content: string}>,
 *   error: string|null,
 *   failedText: string|null,
 *   isSending: boolean,
 *   retryAfterSeconds: number|null,
 *   send: (text: string) => Promise<void>,
 *   reset: () => void
 * }}
 */
export function useAiChat(audience) {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [failedText, setFailedText] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(null);

    const sessionIdRef = useRef(undefined);
    if (sessionIdRef.current === undefined) sessionIdRef.current = newSessionId();

    const conversationRef = useRef(0);
    const sendingRef = useRef(false);

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
            const reply = await sendChatMessage({
                messages: next,
                sessionId: sessionIdRef.current,
                audience,
            });
            if (conversationRef.current !== conversation) return;
            setMessages((current) => [...current, { role: "assistant", content: reply }]);
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
        sessionIdRef.current = newSessionId();
        setMessages([]);
        setError(null);
        setFailedText(null);
        setIsSending(false);
    }, []);

    return { messages, error, failedText, isSending, retryAfterSeconds, send, reset };
}
