"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useChatAnalytics({ audience, messages }) {
    const { trackEvent } = useAnalytics();
    const pathname = usePathname();
    const hasAskedRef = useRef(false);

    const chatProps = useMemo(
        () => ({ audience, page: pathname, logged_in: audience !== "public" }),
        [audience, pathname]
    );

    useEffect(() => {
        const lastReply = messages.filter((m) => m.role !== "lead").at(-1);
        if (lastReply?.role === "assistant") trackEvent("ai_response_received", chatProps);
    }, [messages, chatProps, trackEvent]);

    const trackQuestion = useCallback(
        (turn) => {
            if (!hasAskedRef.current) {
                hasAskedRef.current = true;
                trackEvent("ai_chat_started", chatProps);
            }
            trackEvent("ai_question_sent", { ...chatProps, turn });
        },
        [chatProps, trackEvent]
    );

    const resetSession = useCallback(() => {
        hasAskedRef.current = false;
    }, []);

    return { trackQuestion, resetSession };
}
