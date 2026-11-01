"use client";

import { getChatWelcome } from "@/lib/aiChatConfig";

/**
 * @param {{ audience: string, suggestions: string[], isBlocked: boolean,
 *           onPick: (question: string) => void }} props
 */
export function ChatWelcome({ audience, suggestions, isBlocked, onPick }) {
    const welcome = getChatWelcome(audience);

    return (
        <div className="space-y-4">
            <div>
                <p className="text-sm font-bold text-text-main">{welcome.title}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-text-muted">{welcome.body}</p>
            </div>
            {suggestions.length > 0 && (
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
            )}
        </div>
    );
}
