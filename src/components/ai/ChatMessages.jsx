"use client";

import { ChatLeadSent } from "./ChatLeadForm";

export function ChatMessages({ messages, isSending, error }) {
    return (
        <>
            {messages.map((message, index) => {
                if (message.role === "assistant" && !message.content?.trim() && !message.greetingName) {
                    return null;
                }

                if (message.role === "lead-sent") {
                    return (
                        <ChatLeadSent
                            key={`lead-sent-${index}`}
                            email={message.email}
                            reference={message.reference}
                        />
                    );
                }

                return (
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
                        {message.greetingName ? `Hi ${message.greetingName}! ` : ""}
                        {message.content}
                    </p>
                </div>
                );
            })}

            {isSending && (
                <div className="flex justify-start" role="status" aria-label="Alex is typing">
                    <div className="flex items-center gap-1 rounded-2xl bg-background-light px-3 py-3">
                        <span className="typing-dot h-2 w-2 rounded-full bg-text-muted" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-text-muted" />
                        <span className="typing-dot h-2 w-2 rounded-full bg-text-muted" />
                    </div>
                </div>
            )}

            {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    {error}
                </p>
            )}
        </>
    );
}
