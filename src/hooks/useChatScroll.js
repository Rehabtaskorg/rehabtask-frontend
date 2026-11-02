"use client";

import { useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 100;

export function useChatScroll({ isActive, messages, isSending, error }) {
    const scrollRef = useRef(null);
    const endRef = useRef(null);

    useEffect(() => {
        const list = scrollRef.current;
        if (!isActive || !list) return;

        const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
        if (distanceFromBottom > NEAR_BOTTOM_PX) return;

        const lastEntry = list.lastElementChild?.previousElementSibling;
        if (lastEntry && lastEntry.clientHeight > list.clientHeight) {
            list.scrollTop = lastEntry.offsetTop - list.offsetTop;
            return;
        }

        const prefersReducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        endRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }, [isActive, messages, isSending, error]);

    return { scrollRef, endRef };
}
