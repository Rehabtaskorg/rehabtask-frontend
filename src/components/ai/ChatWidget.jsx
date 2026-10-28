"use client";

import { useEffect, useRef, useState } from "react";
import { MdChat } from "react-icons/md";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ChatPanel } from "./ChatPanel";

/**
 * Keeps the panel mounted while closed so the conversation, draft and rate-limit
 * countdown survive the user closing and reopening the chat.
 *
 * @param {{ audience?: "public"|"customer"|"therapist"|"agency" }} props
 */
export function ChatWidget({ audience = "public" }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef(null);
    const wasOpenRef = useRef(false);
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        if (wasOpenRef.current && !isOpen) buttonRef.current?.focus();
        wasOpenRef.current = isOpen;
    }, [isOpen]);

    const open = () => {
        setIsOpen(true);
        trackEvent("ai_chat_opened", { audience });
    };

    const close = () => {
        setIsOpen(false);
        trackEvent("ai_chat_closed", { audience });
    };

    return (
        <>
            {!isOpen && (
                <button
                    type="button"
                    ref={buttonRef}
                    onClick={open}
                    aria-label="Open the RehabTask assistant"
                    className="fixed right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
                >
                    <MdChat className="text-lg" />
                    Ask RehabTask
                </button>
            )}

            <ChatPanel isOpen={isOpen} audience={audience} onClose={close} />
        </>
    );
}
