"use client";

/**
 * @param {{ suggestions: string[], isBlocked: boolean, onPick: (question: string) => void }} props
 */
export function ChatWelcome({ suggestions, isBlocked, onPick }) {
    return (
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
    );
}
