'use client';

import { useRouter } from 'next/navigation';
import { useConversations } from '@/hooks/useMessages';

// Helper: get display name from the other user object
const getDisplayName = (otherUser) => {
    return (
        otherUser?.therapistProfile?.fullName ||
        otherUser?.customerProfile?.fullName ||
        'Unknown User'
    );
};

// Helper: get initials for avatar fallback
const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
};

// Helper: format timestamp
const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Helper: context label and color
const getContextBadge = (currentContext) => {
    const map = {
        offer: {
            label: 'Offer',
            className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        },
        booking: {
            label: 'Booking',
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        },
    };
    return map[currentContext?.type] || map.offer;
};

function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
        </div>
    );
}

export default function CustomerMessagesPage() {
    const router = useRouter();
    const { conversations, loading, error } = useConversations();

    const handleSelectConversation = (conversation) => {
        const { type, id } = conversation.currentContext;
        router.push(`/customer/messages/${type}/${id}`);
    };

    return (
        <div className="py-6 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-text-main dark:text-white">Messages</h1>
                    <p className="text-sm text-text-muted dark:text-gray-400 mt-1">
                        Your conversations with therapists
                    </p>
                </div>

                {/* Conversation List */}
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-border-light dark:divide-border-dark">
                            {[1, 2, 3, 4].map((i) => (
                                <ConversationSkeleton key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-text-muted dark:text-gray-400 text-sm">{error}</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-text-main dark:text-white mb-1">
                                No conversations yet
                            </h3>
                            <p className="text-text-muted dark:text-gray-400 text-sm max-w-xs">
                                Your conversations with therapists will appear here once messaging begins.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border-light dark:divide-border-dark">
                            {conversations.map((conversation, idx) => {
                                const name = getDisplayName(conversation.otherUser);
                                const badge = getContextBadge(conversation.currentContext);
                                const hasUnread = conversation.unreadCount > 0;

                                return (
                                    <li
                                        key={`${conversation.currentContext?.type}-${conversation.currentContext?.id}-${idx}`}
                                        onClick={() => handleSelectConversation(conversation)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted-light dark:hover:bg-muted-dark cursor-pointer transition-colors"
                                    >
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                {getInitials(name)}
                                            </div>
                                            {hasUnread && (
                                                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-card-dark" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <p className={`text-sm truncate ${hasUnread ? 'font-bold text-text-main dark:text-white' : 'font-medium text-text-main dark:text-white'}`}>
                                                        {name}
                                                    </p>
                                                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
                                                        {badge.label}
                                                    </span>
                                                </div>
                                                <span className="shrink-0 text-[10px] text-text-muted dark:text-gray-500">
                                                    {formatTime(conversation.lastMessage?.createdAt)}
                                                </span>
                                            </div>

                                            {/* Patient label — relevant for agency customers */}
                                            {conversation.patient && (
                                                <p className="text-[11px] text-primary font-medium mb-0.5 truncate">
                                                    Patient: {conversation.patient.fullName}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-xs truncate ${hasUnread ? 'text-text-main dark:text-gray-200 font-medium' : 'text-text-muted dark:text-gray-400'}`}>
                                                    {conversation.lastMessage?.content || 'No messages yet'}
                                                </p>
                                                {hasUnread && (
                                                    <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                                                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}