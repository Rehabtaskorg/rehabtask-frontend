"use client";

import { CHAT_WELCOME } from "@/lib/aiChatConfig";

/**
 * @param {{ suggestions: string[], isBlocked: boolean, onPick: (question: string) => void }} props
 */
export function ChatWelcome({ suggestions, isBlocked, onPick }) {
    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-bold text-text-main">{CHAT_WELCOME.title}</p>
                <p className="mt-1 text-sm text-text-muted">{CHAT_WELCOME.body}</p>
            </div>
            <ul className="space-y-2">
                {suggestions.map((question) => (
                    <li key={question}>
                        <button
                            type="button"
                            onClick={() => onPick(question)}
                            disabled={isBlocked}
                            className="w-full rounded-xl border border-border-light px-3 py-2 text-left text-sm text-text-main hover:border-primary hover:bg-background-light disabled:opacity-50"
                        >
                            {question}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
