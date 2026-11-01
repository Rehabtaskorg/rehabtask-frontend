"use client";

import { MdClose, MdRefresh } from "react-icons/md";

export function ChatHeader({ canReset, onReset, onClose }) {
    return (
        <header className="flex items-center justify-between border-b border-border-light px-4 py-3">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-text-main">Ask RehabTask</h2>
                <span className="rounded-full bg-background-light px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-text-muted">
                    AI assistant
                </span>
            </div>
            <div className="flex items-center gap-1">
                {canReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        aria-label="Start a new conversation"
                        className="rounded-lg p-2 text-text-muted hover:bg-background-light hover:text-text-main"
                    >
                        <MdRefresh className="text-lg" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close chat"
                    className="rounded-lg p-2 text-text-muted hover:bg-background-light hover:text-text-main"
                >
                    <MdClose className="text-lg" />
                </button>
            </div>
        </header>
    );
}
