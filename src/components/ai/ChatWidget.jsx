"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MdChat } from "react-icons/md";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useBodyScrollLocked } from "@/hooks/useBodyScrollLocked";
import { useChatInvite } from "@/hooks/useChatInvite";
import { ChatInvite } from "./ChatInvite";
import { ChatPanel } from "./ChatPanel";

/**
 * Keeps the panel mounted while closed so the conversation, draft and rate-limit
 * countdown survive the user closing and reopening the chat.
 *
 * @param {{ audience?: "public"|"customer"|"therapist"|"agency" }} props
 */
export function ChatWidget({ audience = "public", account = null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const buttonRef = useRef(null);
    const wasOpenRef = useRef(false);
    const { trackEvent } = useAnalytics();
    const pathname = usePathname();
    const isOverlayOpen = useBodyScrollLocked();
    const { isInviteVisible, dismissInvite } = useChatInvite({
        isSuppressed: isOpen || hasOpened || isOverlayOpen,
    });

    useEffect(() => {
        if (wasOpenRef.current && !isOpen) buttonRef.current?.focus();
        wasOpenRef.current = isOpen;
    }, [isOpen]);

    const chatProps = { audience, page: pathname, logged_in: audience !== "public" };

    const open = (source = "button") => {
        setIsOpen(true);
        setHasOpened(true);
        dismissInvite();
        trackEvent("ai_chat_opened", { ...chatProps, source });
    };

    const close = () => {
        setIsOpen(false);
        trackEvent("ai_chat_closed", chatProps);
    };

    return (
        <>
            {!isOpen && !isOverlayOpen && (
                <>
                    {isInviteVisible && (
                        <ChatInvite onOpen={() => open("invite")} onDismiss={dismissInvite} />
                    )}

                    <button
                        type="button"
                        ref={buttonRef}
                        onClick={() => open("button")}
                        aria-label="Open the RehabTask assistant"
                        className={`fixed right-6 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[100] flex items-center gap-2 rounded-full bg-accent-strong px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90 ${isInviteVisible ? "chat-attract" : ""}`}
                    >
                        <MdChat className="text-lg" />
                        Ask RehabTask
                    </button>
                </>
            )}

            <ChatPanel isOpen={isOpen} audience={audience} account={account} onClose={close} />
        </>
    );
}
