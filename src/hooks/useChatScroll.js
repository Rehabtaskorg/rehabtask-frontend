"use client";

import { useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 100;

export function useChatScroll({ isActive, messages, isSending, error, isLeadOffered }) {
    const scrollRef = useRef(null);
    const endRef = useRef(null);
    const isPinnedRef = useRef(true);

    useEffect(() => {
        const list = scrollRef.current;
        if (!list) return undefined;

        const onScroll = () => {
            const distance = list.scrollHeight - list.scrollTop - list.clientHeight;
            isPinnedRef.current = distance <= NEAR_BOTTOM_PX;
        };

        list.addEventListener("scroll", onScroll, { passive: true });
        return () => list.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const list = scrollRef.current;
        if (!isActive || !list) return;

        const justSent = messages.at(-1)?.role === "user";
        if (justSent) isPinnedRef.current = true;
        if (!isPinnedRef.current) return;

        const prefersReducedMotion = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const isLongReply = list.scrollHeight - list.scrollTop - list.clientHeight > list.clientHeight;

        isPinnedRef.current = true;
        list.scrollTo({
            top: list.scrollHeight,
            behavior: prefersReducedMotion || isLongReply ? "auto" : "smooth",
        });
    }, [isActive, messages, isSending, error, isLeadOffered]);

    return { scrollRef, endRef };
}
