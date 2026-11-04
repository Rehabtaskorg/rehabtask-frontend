"use client";

import { MdClose } from "react-icons/md";
import { CHAT_INVITE } from "@/lib/aiChatConfig";

export function ChatInvite({ onOpen, onDismiss }) {
    return (
        <div className="fixed right-6 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4rem))] z-[100] flex max-w-[16rem] items-start gap-2 rounded-2xl border border-border-light bg-white px-3 py-2.5 shadow-lg motion-safe:animate-[fadeInUp_220ms_ease-out]">
            <button
                type="button"
                onClick={onOpen}
                className="text-left text-sm text-text-main hover:underline"
            >
                {CHAT_INVITE.message}
            </button>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss the assistant invitation"
                className="-mr-1 -mt-0.5 shrink-0 rounded-lg p-1 text-text-muted hover:bg-background-light hover:text-text-main"
            >
                <MdClose className="text-base" />
            </button>
        </div>
    );
}
