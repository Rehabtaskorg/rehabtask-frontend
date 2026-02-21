"use client";

import { useRef, useEffect } from "react";
import { MessageSkeleton } from "./Skeletons";
import MessageBubble from "./MessageBubble";

function HipaaNotice() {
    return (
        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-muted-light dark:bg-muted-dark border-t border-border-light dark:border-border-dark shrink-0">
            <svg className="w-3 h-3 text-text-muted dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-[10px] text-text-muted dark:text-gray-500 font-medium">Messages are encrypted and HIPAA compliant</span>
        </div>
    );
}

function EmptyConversation() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-sm font-medium text-text-main dark:text-white">Start the conversation</p>
            <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Send a message to get things started.</p>
        </div>
    );
}

function NoConversationSelected() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="font-semibold text-text-main dark:text-white mb-1">Select a conversation</h3>
            <p className="text-text-muted dark:text-gray-400 text-sm max-w-xs">Choose a conversation from the list to start chatting.</p>
        </div>
    );
}

/**
 * @param {Object} props
 * @param {Array}   props.messages
 * @param {boolean} props.loading
 * @param {string|null} props.error
 * @param {Object}  props.currentUser
 * @param {Function} props.retryMessage
 * @param {React.ReactNode} [props.emptyStateExtra] - content above the empty state (e.g. SessionOfferWidget)
 * @param {React.ReactNode} [props.beforeMessages] - content before the messages list (e.g. SessionOfferWidget for non-empty)
 */
export default function ChatThread({ messages, loading, error, currentUser, retryMessage, emptyStateExtra, beforeMessages }) {
    const messagesEndRef = useRef(null);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (messages.length === 0) return;
        if (isFirstLoad.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            isFirstLoad.current = false;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Reset scroll flag when thread changes
    useEffect(() => {
        isFirstLoad.current = true;
    }, [currentUser]);

    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 bg-background-light dark:bg-background-dark">
                {loading ? (
                    <MessageSkeleton />
                ) : error ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-text-muted dark:text-gray-400">{error}</p>
                    </div>
                ) : messages.length === 0 ? (
                    <>
                        {emptyStateExtra}
                        <EmptyConversation />
                    </>
                ) : (
                    <>
                        {beforeMessages}
                        {messages.map((msg, idx) => (
                            <MessageBubble
                                key={msg.id}
                                msg={msg}
                                messages={messages}
                                index={idx}
                                currentUser={currentUser}
                                onRetry={retryMessage}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
            <HipaaNotice />
        </>
    );
}

ChatThread.NoConversationSelected = NoConversationSelected;