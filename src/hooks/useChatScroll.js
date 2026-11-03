"use client";

import { useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 100;

export function useChatScroll({ isActive, messages, isSending, error }) {
    const scrollRef = useRef(null);
    const endRef = useRef(null);

    useEffect(() => {
        const list = scrollRef.current;
        if (!isActive || !list) return;

        const justSent = messages.at(-1)?.role === "user";
        const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
        if (!justSent && distanceFromBottom > NEAR_BOTTOM_PX) return;

        const prefersReducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const isLongReply = list.scrollHeight - list.scrollTop - list.clientHeight > list.clientHeight;

        list.scrollTo({
            top: list.scrollHeight,
            behavior: prefersReducedMotion || isLongReply ? "auto" : "smooth",
        });
    }, [isActive, messages, isSending, error]);

    return { scrollRef, endRef };
}
