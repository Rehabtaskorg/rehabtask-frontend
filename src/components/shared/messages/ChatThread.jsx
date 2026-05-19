"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MessageSkeleton } from "./Skeletons";
import MessageBubble from "./MessageBubble";

function HipaaNotice() {
    return (
        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-muted-light  border-t border-border-light  shrink-0">
            <svg className="w-3 h-3 text-text-muted " fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span className="text-[10px] text-text-muted  font-medium">Messages are encrypted and HIPAA compliant</span>
        </div>
    );
}

function EmptyConversation() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-sm font-medium text-text-main ">Start the conversation</p>
            <p className="text-xs text-text-muted  mt-1">Send a message to get things started.</p>
        </div>
    );
}

function NoConversationSelected() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="font-semibold text-text-main  mb-1">Select a conversation</h3>
            <p className="text-text-muted  text-sm max-w-xs">Choose a conversation from the list to start chatting.</p>
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
export default function ChatThread({ messages, loading, error, currentUser, retryMessage, onReply, emptyStateExtra, beforeMessages, threadId, hasMore, loadOlderMessages, loadingMore, scrollTrigger }) {
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const isFirstLoad = useRef(true);
    const prevThreadId = useRef(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToBottom = useCallback((behavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    // Reset scroll flag when the conversation thread changes
    useEffect(() => {
        if (threadId !== prevThreadId.current) {
            isFirstLoad.current = true;
            prevThreadId.current = threadId;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowScrollButton(false);
        }
    }, [threadId]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (messages.length === 0) return;
        if (isFirstLoad.current) {
            scrollToBottom("instant");
            isFirstLoad.current = false;
        } else if (!showScrollButton) {
            scrollToBottom("smooth");
        }
    }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

    // External scroll trigger — used when parent sends a message while scrolled up
    useEffect(() => {
        if (scrollTrigger) {
            scrollToBottom("smooth");
        }
    }, [scrollTrigger, scrollToBottom]);

    // Track scroll position to show/hide the scroll-to-bottom button
    const handleScroll = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setShowScrollButton(distanceFromBottom > 200);
    }, []);

    return (
        <>
            <div className="flex-1 relative overflow-hidden">
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="absolute inset-0 overflow-y-auto p-4 md:p-6 space-y-1 bg-background-light "
                >
                    {loading ? (
                        <MessageSkeleton />
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-text-muted ">{error}</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <>
                            {emptyStateExtra}
                            <EmptyConversation />
                        </>
                    ) : (
                        <>
                            {hasMore && (
                                <div className="flex justify-center py-2">
                                    <button
                                        type="button"
                                        onClick={loadOlderMessages}
                                        disabled={loadingMore}
                                        className="px-4 py-1.5 rounded-full text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 disabled:opacity-50 transition-colors"
                                    >
                                        {loadingMore ? 'Loading...' : 'Load older messages'}
                                    </button>
                                </div>
                            )}
                            {beforeMessages}
                            {messages.map((msg, idx) => (
                                <MessageBubble
                                    key={msg.id}
                                    msg={msg}
                                    messages={messages}
                                    index={idx}
                                    currentUser={currentUser}
                                    onRetry={retryMessage}
                                    onReply={onReply}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Scroll-to-bottom floating button — inside the relative container */}
                {showScrollButton && (
                    <button
                        onClick={() => scrollToBottom("smooth")}
                        className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-card-light  border border-border-light  shadow-lg flex items-center justify-center text-text-muted  hover:text-primary hover:border-primary/30 transition-all"
                        aria-label="Scroll to bottom"
                    >
                        <MdKeyboardArrowDown className="text-xl" />
                    </button>
                )}
            </div>
            <HipaaNotice />
        </>
    );
}

ChatThread.NoConversationSelected = NoConversationSelected;