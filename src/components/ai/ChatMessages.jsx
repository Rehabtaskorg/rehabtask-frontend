"use client";

/**
 * @param {{ messages: Array<{role: "user"|"assistant", content: string}>,
 *           isSending: boolean, error: string|null }} props
 */
export function ChatMessages({ messages, isSending, error }) {
    return (
        <>
            {messages.map((message, index) => (
                <div
                    key={`${message.role}-${index}`}
                    className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                    <p
                        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${message.role === "user"
                            ? "bg-primary text-white"
                            : "bg-background-light text-text-main"
                            }`}
                    >
                        {message.content}
                    </p>
                </div>
            ))}

            {isSending && <p className="text-sm text-text-muted" role="status">Thinking…</p>}

            {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}
        </>
    );
}
