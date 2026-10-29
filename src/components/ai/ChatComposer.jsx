"use client";

import { useLayoutEffect } from "react";
import { MdSend, MdSupportAgent } from "react-icons/md";
import { AI_CHAT } from "@/services/ai.api";
import { PHI_NOTICE, SUPPORT_EMAIL } from "@/lib/aiChatConfig";

const MAX_INPUT_HEIGHT = 120;

/**
 * @param {{ draft: string, onDraftChange: (value: string) => void,
 *           onSubmit: (text: string) => void, isBlocked: boolean,
 *           cooldown: number, inputRef: React.RefObject<HTMLTextAreaElement>,
 *           onSupportClick: () => void }} props
 */
export function ChatComposer({
    draft,
    onDraftChange,
    onSubmit,
    isBlocked,
    cooldown,
    inputRef,
    onSupportClick,
}) {
    useLayoutEffect(() => {
        const input = inputRef.current;
        if (!input) return;

        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, MAX_INPUT_HEIGHT)}px`;
    }, [draft, inputRef]);

    return (
        <footer className="border-t border-border-light px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit(draft);
                }}
                className="flex items-end gap-2"
            >
                <label htmlFor="ai-chat-input" className="sr-only">Your message</label>
                <textarea
                    id="ai-chat-input"
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => onDraftChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                            event.preventDefault();
                            onSubmit(draft);
                        }
                    }}
                    maxLength={AI_CHAT.maxInputChars}
                    rows={1}
                    placeholder="Ask a question…"
                    className="flex-1 resize-none overflow-y-auto rounded-xl border border-border-light px-3 py-2 text-base text-text-main outline-none focus:border-primary sm:text-sm"
                />
                <button
                    type="submit"
                    disabled={isBlocked || !draft.trim()}
                    aria-label="Send message"
                    className="rounded-xl bg-primary p-2.5 text-white disabled:opacity-40"
                >
                    <MdSend className="text-lg" />
                </button>
            </form>

            {cooldown > 0 && (
                <p className="mt-2 text-xs text-text-muted" role="status">Try again in {cooldown}s</p>
            )}

            <p className="mt-2 text-xs text-text-muted">{PHI_NOTICE}</p>

            <a
                href={`mailto:${SUPPORT_EMAIL}`}
                onClick={onSupportClick}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
                <MdSupportAgent className="text-sm" />
                Contact Support
            </a>
        </footer>
    );
}
