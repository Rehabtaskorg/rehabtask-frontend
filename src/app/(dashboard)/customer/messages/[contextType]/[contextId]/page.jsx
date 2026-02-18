'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';

// Helper: get display name
const getDisplayName = (user) => {
    return (
        user?.therapistProfile?.fullName ||
        user?.customerProfile?.fullName ||
        'Unknown User'
    );
};

// Helper: get initials
const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
};

// Helper: format message timestamp
const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Helper: format date separator
const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    });
};

// Determine if we should show a date separator before this message
const shouldShowDateSeparator = (messages, index) => {
    if (index === 0) return true;
    const prev = new Date(messages[index - 1].createdAt);
    const curr = new Date(messages[index].createdAt);
    return prev.toDateString() !== curr.toDateString();
};

const getContextLabel = (contextType) => {
    return contextType === 'booking' ? 'Booking Conversation' : 'Request Conversation';
};

function MessageSkeleton() {
    return (
        <div className="flex flex-col gap-4 p-6">
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className={`flex items-end gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'} animate-pulse`}
                >
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
                    <div className={`h-10 rounded-xl bg-gray-200 dark:bg-gray-700 ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
                </div>
            ))}
        </div>
    );
}

export default function CustomerConversationThreadPage({ params }) {
    const [contextType, setContextType] = useState(null);
    const [contextId, setContextId] = useState(null);

    const router = useRouter();
    const { user } = useAuth();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const isFirstLoad = useRef(true);

    // Unwrap async params
    useEffect(() => {
        Promise.resolve(params).then((resolved) => {
            setContextType(resolved.contextType);
            setContextId(resolved.contextId);
        });
    }, [params]);

    const { messages, loading, sending, error, sendMessage } = useMessages(
        contextType,
        contextId
    );

    // Scroll to bottom on first load and when new messages arrive
    useEffect(() => {
        if (messages.length === 0) return;

        if (isFirstLoad.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            isFirstLoad.current = false;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!inputValue.trim() || sending) return;

        const content = inputValue;
        setInputValue('');

        const success = await sendMessage(content);
        if (!success) {
            setInputValue(content);
        }

        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Validate contextType
    if (!['request', 'booking'].includes(contextType)) {
        return (
            <div className="py-6 px-4">
                <div className="max-w-3xl mx-auto text-center py-16">
                    <p className="text-text-muted dark:text-gray-400">
                        Invalid conversation type.
                    </p>
                    <Link
                        href="/customer/messages"
                        className="text-primary text-sm font-medium mt-2 inline-block"
                    >
                        Back to Messages
                    </Link>
                </div>
            </div>
        );
    }

    // Derive other user from messages
    const otherUser =
        messages.find((m) => m.sender?.id !== user?.id)?.sender ||
        messages[0]?.sender;
    const otherUserName = getDisplayName(otherUser);

    return (
        <div className="py-6 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back + Header */}
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={() => router.push('/customer/messages')}
                        className="flex items-center justify-center h-9 w-9 rounded-lg border border-border-light dark:border-border-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors text-text-muted dark:text-gray-400"
                        aria-label="Back to messages"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                            {getInitials(otherUserName)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-text-main dark:text-white truncate">
                                {loading && !otherUser ? 'Loading...' : otherUserName}
                            </h2>
                            <p className="text-xs text-text-muted dark:text-gray-400">
                                {getContextLabel(contextType)}
                            </p>
                        </div>
                    </div>

                    {/* ✅ KEY DIFFERENCE: Points to /customer routes, not /therapist */}
                    <Link
                        href={`/customer/${contextType === 'booking' ? 'bookings' : 'requests'}/${contextId}`}
                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                        View {contextType === 'booking' ? 'Booking' : 'Request'}
                    </Link>
                </div>

                {/* Chat Window */}
                <div
                    className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden flex flex-col"
                    style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}
                >
                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-background-light dark:bg-background-dark">
                        {loading ? (
                            <MessageSkeleton />
                        ) : error ? (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-text-muted dark:text-gray-400">{error}</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-text-main dark:text-white">
                                    Start the conversation
                                </p>
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                                    Send a message to get things started.
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => {
                                    const isSender =
                                        msg.sender?.id === user?.id ||
                                        msg.senderId === user?.id;
                                    const showDateSep = shouldShowDateSeparator(messages, idx);
                                    const senderName = getDisplayName(msg.sender);

                                    return (
                                        <div key={msg.id}>
                                            {/* Date separator */}
                                            {showDateSep && (
                                                <div className="flex items-center justify-center my-4">
                                                    <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
                                                    <span className="mx-3 text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-widest">
                                                        {formatDateSeparator(msg.createdAt)}
                                                    </span>
                                                    <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
                                                </div>
                                            )}

                                            {/* Message bubble */}
                                            <div className={`flex items-end gap-2 mb-2 ${isSender ? 'flex-row-reverse' : ''}`}>
                                                {/* Avatar — only for received messages */}
                                                {!isSender && (
                                                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mb-0.5">
                                                        {getInitials(senderName)}
                                                    </div>
                                                )}

                                                <div className={`flex flex-col gap-0.5 max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                                                    <div
                                                        className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isSender
                                                            ? 'bg-primary text-white rounded-br-sm'
                                                            : 'bg-card-light dark:bg-card-dark text-text-main dark:text-white border border-border-light dark:border-border-dark rounded-bl-sm'
                                                            }`}
                                                    >
                                                        {msg.content}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-1">
                                                        <span className="text-[10px] text-text-muted dark:text-gray-500">
                                                            {formatMessageTime(msg.createdAt)}
                                                        </span>
                                                        {/* Read receipt for sent messages */}
                                                        {isSender && msg.readAt && (
                                                            <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Spacer for sent messages */}
                                                {isSender && <div className="w-7 shrink-0" />}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* HIPAA Notice */}
                    <div className="flex items-center justify-center gap-1.5 py-1.5 bg-muted-light dark:bg-muted-dark border-t border-border-light dark:border-border-dark">
                        <svg className="w-3 h-3 text-text-muted dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-[10px] text-text-muted dark:text-gray-500 font-medium">
                            Messages are encrypted and HIPAA compliant
                        </span>
                    </div>

                    {/* Input area */}
                    <div className="p-3 border-t border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
                        <form onSubmit={handleSend} className="flex items-end gap-2">
                            <div className="flex-1 min-w-0 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message... (Enter to send)"
                                    rows={1}
                                    maxLength={2000}
                                    className="w-full resize-none border-none bg-transparent focus:outline-none focus:ring-0 text-sm text-text-main dark:text-white placeholder:text-text-muted dark:placeholder:text-gray-500 px-3.5 py-2.5 leading-relaxed"
                                    style={{ minHeight: '42px', maxHeight: '120px' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                                    }}
                                    disabled={sending}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!inputValue.trim() || sending}
                                className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
                                aria-label="Send message"
                            >
                                {sending ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </form>

                        <p className="text-[10px] text-text-muted dark:text-gray-500 mt-1.5 text-right">
                            {inputValue.length}/2000
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}