'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useConversations, useMessages, useConversationContext } from '@/hooks/useMessages';
import { useOfferDetails } from '@/hooks/useOffers';
import { useAuth } from '@/hooks/useAuth';


const getDisplayName = (user) =>
    user?.therapistProfile?.fullName ||
    user?.customerProfile?.fullName ||
    'Unknown User';

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const formatMessageTime = (dateString) =>
    new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDateSeparator = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((today - msgDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
const shouldShowDateSeparator = (messages, index) => {
    if (index === 0) return true;
    return (
        new Date(messages[index - 1].createdAt).toDateString() !==
        new Date(messages[index].createdAt).toDateString()
    );
};

const getContextBadge = (type) => {
    if (type === 'booking') {
        return { label: 'Booking', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' };
    }
    return { label: 'Offer', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' };
};

const getOfferStatusBadge = (status) => {
    switch (status) {
        case 'accepted':
            return { label: 'ACCEPTED', className: 'bg-green-500 text-white' };
        case 'rejected':
            return { label: 'REJECTED', className: 'bg-red-500 text-white' };
        case 'expired':
            return { label: 'EXPIRED', className: 'bg-gray-500 text-white' };
        default:
            return { label: 'PENDING', className: 'bg-primary text-white' };
    }
}

const formatOfferDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

const formatOfferTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const start = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const end = new Date(d.getTime() + 60 * 60 * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${start} - ${end}`;
};

const formatCurrency = (amount) => {
    if (amount == null) return '$0.00';
    return `$${Number(amount).toFixed(2)}`;
};

function ConversationSkeleton() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 animate-pulse border-l-4 border-transparent">
            <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
        </div>
    );
}

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

function RightSidebarSkeleton() {
    return (
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2" />
            <div className="w-full space-y-3">
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-16 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
        </div>
    );
}

function SessionOfferWidget({ offerId }) {
    const { offer, loading, error } = useOfferDetails(offerId);

    if (loading) {
        return (
            <div className="flex flex-col items-center py-2">
                <div className="w-full max-w-sm bg-card-light dark:bg-card-dark border-2 border-primary/20 rounded-xl p-5 animate-pulse">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                    <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
            </div>
        );
    }

    if (error || !offer) return null;

    const statusBadge = getOfferStatusBadge(offer.status);

    return (
        <div className="flex flex-col items-center py-2">
            <div className="w-full max-w-sm bg-card-light dark:bg-card-dark border-2 border-primary/30 dark:border-primary/50 rounded-xl overflow-hidden shadow-lg">
                {/* Header */}
                <div className="bg-primary/10 dark:bg-primary/20 px-4 py-3 border-b border-primary/20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h4 className="text-primary font-bold text-sm tracking-tight">New Session Offer</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge.className}`}>
                        {statusBadge.label}
                    </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase">Session Type</p>
                            <p className="text-text-main dark:text-white font-bold text-base">
                                {offer.sessionType || 'Session'}{offer.description ? ` - ${offer.description}` : ''}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase">Rate</p>
                            <p className="text-primary font-bold text-xl">{formatCurrency(offer.rate)}</p>
                        </div>
                    </div>

                    {offer.proposedDate && (
                        <div className="flex items-center gap-4 bg-background-light dark:bg-background-dark p-3 rounded-lg">
                            <div className="flex flex-col flex-1 border-r border-border-light dark:border-border-dark">
                                <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase">Date</p>
                                <p className="text-text-main dark:text-white text-sm font-medium">{formatOfferDate(offer.proposedDate)}</p>
                            </div>
                            <div className="flex flex-col flex-1 pl-2">
                                <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase">Time</p>
                                <p className="text-text-main dark:text-white text-sm font-medium">{formatOfferTime(offer.proposedDate)}</p>
                            </div>
                        </div>
                    )}

                    <p className="text-center text-[10px] text-text-muted dark:text-gray-500 italic">
                        {offer.status === 'pending'
                            ? 'Awaiting patient response'
                            : offer.status === 'accepted'
                                ? 'Offer accepted by patient'
                                : offer.status === 'rejected'
                                    ? 'Offer declined by patient'
                                    : 'Offer expired'}
                    </p>
                </div>
            </div>
            {offer.createdAt && (
                <p className="text-[10px] text-text-muted dark:text-gray-500 mt-2">
                    Offer sent at {formatMessageTime(offer.createdAt)}
                </p>
            )}
        </div>
    )
}

function RightSidebar({ selectedConversation }) {
    const contextType = selectedConversation?.currentContext?.type;
    const contextId = selectedConversation?.currentContext?.id;

    const { otherUser: contextOtherUser, patient: contextPatient, loading: contextLoading } = useConversationContext(contextType, contextId);

    const otherUser = selectedConversation?.otherUser || contextOtherUser;
    const patient = selectedConversation?.patient || contextPatient;
    const name = otherUser ? getDisplayName(otherUser) : 'Unknown';
    const badge = getContextBadge(contextType);

    if (contextLoading && !otherUser) {
        return <RightSidebarSkeleton />;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Profile section */}
            <div className="flex flex-col items-center text-center gap-3">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-4 border-card-light dark:border-card-dark shadow-md">
                    {getInitials(name)}
                </div>
                <div>
                    <h4 className="text-text-main dark:text-white text-base font-bold">{name}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                        {badge.label}
                    </span>
                </div>
            </div>

            {/* Patient info */}
            {patient && (
                <div className="mt-6 space-y-1">
                    <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Patient Info</p>
                    <p className="text-text-main dark:text-white text-sm font-medium">{patient.fullName}</p>
                </div>
            )}

            {/* Context details */}
            <div className="mt-4 space-y-1">
                <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Context</p>
                {contextType === 'booking' ? (
                    <Link
                        href={`/therapist/bookings/${contextId}`}
                        className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Booking
                    </Link>
                ) : (
                    <p className="text-text-main dark:text-white text-sm">Offer Conversation</p>
                )}
            </div>

            {/* Upcoming Session (for bookings with date info) */}
            {contextType === 'booking' && (
                <div className="mt-4 space-y-2">
                    <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Upcoming Session</p>
                    <div className="p-3 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20">
                        <p className="text-[10px] text-primary font-bold">NEXT SESSION</p>
                        <p className="text-xs text-text-main dark:text-white font-bold mt-1">View booking for details</p>
                        <Link
                            href={`/therapist/bookings/${contextId}`}
                            className="text-[10px] text-primary font-medium hover:underline mt-1 inline-block"
                        >
                            Go to booking →
                        </Link>
                    </div>
                </div>
            )}

            {/* Archive button (visual only) */}
            <div className="mt-auto pt-6">
                <button
                    type="button"
                    className="w-full py-2.5 px-4 text-center text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                    Archive Conversation
                </button>
            </div>
        </div>
    )


}

export default function TherapistMessagesPage() {
    const { conversations, loading: convLoading, error: convError } = useConversations();
    const { user } = useAuth();

    const [selectedConversation, setSelectedConversation] = useState(null);
    const selected = selectedConversation
        ? {
            type: selectedConversation.currentContext?.type,
            id: selectedConversation.currentContext?.id,
            name: getDisplayName(selectedConversation.otherUser),
        } : null;

    // Mobile: which panel is visible ('list' | 'chat')
    const [mobileView, setMobileView] = useState('list');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'offers
    const [inputValue, setInputValue] = useState('');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const isFirstLoad = useRef(true);

    const { messages, loading: msgLoading, error: msgError, sendMessage, retryMessage } = useMessages(
        selected?.type,
        selected?.id
    );

    // Reset scroll flag and input when switching conversations
    // Must be declared before the scroll effect so it runs first
    useEffect(() => {
        if (selected?.id) {
            isFirstLoad.current = true;
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInputValue('');
        }
    }, [selected?.id]);

    // Auto-scroll to bottom when messages arrive
    useEffect(() => {
        if (messages.length === 0) return;
        if (isFirstLoad.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            isFirstLoad.current = false;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = (e) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;
        const content = inputValue;
        setInputValue('');
        sendMessage(content);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setMobileView('chat');
    };

    const filtered = conversations.filter((c) => {
        const nameMatch =
            !search.trim() ||
            getDisplayName(c.otherUser).toLowerCase().includes(search.toLowerCase());
        const filterMatch =
            filter === 'all' ||
            (filter === 'unread' && c.unreadCount > 0) ||
            (filter === 'offers' && c.currentContext?.type === 'offer');
        return nameMatch && filterMatch;
    });

    const badge = selected ? getContextBadge(selected.type) : null;

    return (
        <div className="flex h-[calc(100vh-112px)] min-h-125 rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">

            {/* ─── Left Panel: Conversation List ─────────────────────────── */}
            <aside
                className={`
                    w-full md:w-80 shrink-0 flex flex-col
                    border-r border-border-light dark:border-border-dark
                    bg-background-light/30 dark:bg-background-dark/50
                    ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
                `}
            >
                {/* Panel header */}
                <div className="p-4 border-b border-border-light dark:border-border-dark flex flex-col gap-3 shrink-0">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-base font-bold text-text-main dark:text-white">Conversations</h1>
                            <p className="text-xs text-text-muted dark:text-gray-400">
                                {!convLoading && conversations.length > 0
                                    ? `${conversations.length} active conversation${conversations.length !== 1 ? 's' : ''}`
                                    : 'Your patient conversations'}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="text-primary text-sm font-bold flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New
                        </button>
                    </div>

                    {/* Search */}
                    <div className="flex items-stretch rounded-lg border border-border-light dark:border-border-dark overflow-hidden h-9">
                        <div className="flex items-center justify-center px-3 bg-card-light dark:bg-card-dark text-text-muted dark:text-gray-500 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-card-light dark:bg-card-dark text-sm text-text-main dark:text-white placeholder:text-text-muted dark:placeholder:text-gray-500 px-3 focus:outline-none border-none min-w-0"
                        />
                    </div>

                    {/* Filter pills */}
                    <div className="flex gap-2 overflow-x-auto">
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'unread', label: 'Unread' },
                            { key: 'offers', label: 'Active Offers' },
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${filter === f.key
                                    ? 'bg-primary text-white'
                                    : 'bg-muted-light dark:bg-muted-dark text-text-main dark:text-white hover:bg-primary/10 dark:hover:bg-primary/20'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto">
                    {convLoading ? (
                        <>{[1, 2, 3, 4].map((i) => <ConversationSkeleton key={i} />)}</>
                    ) : convError ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-text-muted dark:text-gray-400 text-sm">{convError}</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-text-main dark:text-white mb-1 text-sm">No conversations yet</h3>
                            <p className="text-text-muted dark:text-gray-400 text-xs max-w-50">
                                Your conversations will appear here once you start messaging customers.
                            </p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex items-center justify-center py-12 px-4 text-center">
                            <p className="text-text-muted dark:text-gray-400 text-sm">
                                {search.trim()
                                    ? `No results for "${search}"`
                                    : filter === 'unread'
                                        ? 'No unread conversations'
                                        : 'No active offers'}
                            </p>
                        </div>
                    ) : (
                        <ul>
                            {filtered.map((conversation, idx) => {
                                const name = getDisplayName(conversation.otherUser);
                                const b = getContextBadge(conversation.currentContext?.type);
                                const hasUnread = conversation.unreadCount > 0;
                                const isSelected =
                                    selected?.id === conversation.currentContext?.id &&
                                    selected?.type === conversation.currentContext?.type;

                                return (
                                    <li
                                        key={`${conversation.currentContext?.type}-${conversation.currentContext?.id}-${idx}`}
                                        onClick={() => handleSelectConversation(conversation)}
                                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-4 ${isSelected
                                            ? 'border-primary bg-primary/10 dark:bg-primary/20'
                                            : 'border-transparent hover:bg-muted-light dark:hover:bg-muted-dark'
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                {getInitials(name)}
                                            </div>
                                            {hasUnread && (
                                                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-card-dark" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <p className={`text-sm truncate ${hasUnread ? 'font-bold' : 'font-medium'} text-text-main dark:text-white`}>
                                                        {name}
                                                    </p>
                                                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${b.className}`}>
                                                        {b.label}
                                                    </span>
                                                </div>
                                                <span className="shrink-0 text-[10px] text-text-muted dark:text-gray-500">
                                                    {formatTime(conversation.lastMessage?.createdAt)}
                                                </span>
                                            </div>

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
                                                    <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
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
            </aside>

            {/* ─── Center Panel: Chat Thread ──────────────────────────────── */}
            <section
                className={`flex-1 flex flex-col min-w-0 bg-card-light dark:bg-card-dark ${mobileView === 'list' ? 'hidden md:flex' : 'flex'
                    }`}
            >
                {!selected ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-text-main dark:text-white mb-1">Select a conversation</h3>
                        <p className="text-text-muted dark:text-gray-400 text-sm max-w-xs">
                            Choose a conversation from the list to start chatting.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* ── Enhanced Chat Header ────────────────────────── */}
                        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Back button — mobile only */}
                                <button
                                    onClick={() => setMobileView('list')}
                                    className="md:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors text-text-muted dark:text-gray-400 shrink-0"
                                    aria-label="Back to conversations"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                                    {getInitials(selected.name)}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-text-main dark:text-white truncate">
                                            {selected.name}
                                        </h3>
                                        {badge && (
                                            <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${badge.className}`}>
                                                {badge.label}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-muted dark:text-gray-400">
                                        {selected.type === 'booking' ? 'Booking Conversation' : 'Offer Conversation'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-3">
                                {selected.type === 'booking' && (
                                    <Link
                                        href={`/therapist/bookings/${selected.id}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        View Booking
                                    </Link>
                                )}
                                {selected.type === 'offer' && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white text-xs font-bold">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        View Offer
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── Messages area ───────────────────────────────── */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 bg-background-light dark:bg-background-dark">
                            {msgLoading ? (
                                <MessageSkeleton />
                            ) : msgError ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-text-muted dark:text-gray-400">{msgError}</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    {/* Show offer widget even with no messages */}
                                    {selected.type === 'offer' && (
                                        <div className="mb-6 w-full">
                                            <SessionOfferWidget offerId={selected.id} />
                                        </div>
                                    )}
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-text-main dark:text-white">Start the conversation</p>
                                    <p className="text-xs text-text-muted dark:text-gray-400 mt-1">Send a message to get things started.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Offer widget at top of messages */}
                                    {selected.type === 'offer' && (
                                        <SessionOfferWidget offerId={selected.id} />
                                    )}

                                    {messages.map((msg, idx) => {
                                        if (msg.type === 'system') {
                                            return (
                                                <div key={msg.id} className="flex items-center justify-center my-4">
                                                    <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
                                                    <span className="mx-3 text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-full">
                                                        {msg.content}
                                                    </span>
                                                    <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
                                                </div>
                                            );
                                        }

                                        const isSender = msg.sender?.id === user?.id || msg.senderId === user?.id;
                                        const showDateSep = shouldShowDateSeparator(messages, idx);
                                        const senderName = getDisplayName(msg.sender);
                                        const isSending = msg.status === 'sending';
                                        const isFailed = msg.status === 'failed';

                                        return (
                                            <div key={msg.id}>
                                                {showDateSep && (
                                                    <div className="flex items-center justify-center my-4">
                                                        <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
                                                        <span className="mx-3 text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-widest">
                                                            {formatDateSeparator(msg.createdAt)}
                                                        </span>
                                                        <div className="h-px bg-border-light dark:bg-border-dark flex-1" />
                                                    </div>
                                                )}

                                                <div className={`flex items-end gap-2 mb-2 ${isSender ? 'flex-row-reverse' : ''}`}>
                                                    {!isSender && (
                                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0 mb-0.5">
                                                            {getInitials(senderName)}
                                                        </div>
                                                    )}

                                                    <div className={`flex flex-col gap-0.5 max-w-[70%] ${isSender ? 'items-end' : 'items-start'}`}>
                                                        <div
                                                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-opacity ${isSender
                                                                ? isFailed
                                                                    ? 'bg-primary text-white rounded-br-sm border-2 border-red-400'
                                                                    : 'bg-primary text-white rounded-br-sm'
                                                                : 'bg-card-light dark:bg-card-dark text-text-main dark:text-white border border-border-light dark:border-border-dark rounded-bl-sm'
                                                                } ${isSending ? 'opacity-60' : ''}`}
                                                        >
                                                            {msg.content}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-1">
                                                            {isFailed ? (
                                                                <>
                                                                    <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span className="text-[10px] text-red-500 font-medium">Not delivered</span>
                                                                    <span className="text-[10px] text-text-muted dark:text-gray-500">&middot;</span>
                                                                    <button
                                                                        onClick={() => retryMessage(msg.id)}
                                                                        className="text-[10px] text-primary font-semibold hover:underline"
                                                                    >
                                                                        Try again
                                                                    </button>
                                                                </>
                                                            ) : isSending ? (
                                                                <span className="text-[10px] text-text-muted dark:text-gray-500 italic">
                                                                    Sending…
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    <span className="text-[10px] text-text-muted dark:text-gray-500">
                                                                        {formatMessageTime(msg.createdAt)}
                                                                    </span>
                                                                    {isSender && msg.readAt && (
                                                                        <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {isSender && <div className="w-7 shrink-0" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* ── HIPAA notice ────────────────────────────────── */}
                        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-muted-light dark:bg-muted-dark border-t border-border-light dark:border-border-dark shrink-0">
                            <svg className="w-3 h-3 text-text-muted dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-[10px] text-text-muted dark:text-gray-500 font-medium">
                                Messages are encrypted and HIPAA compliant
                            </span>
                        </div>

                        {/* ── Enhanced Input Area ─────────────────────────── */}
                        <div className="px-3 md:px-6 py-3 border-t border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark shrink-0">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-end gap-2 md:gap-3">
                                    {/* Plus / attachment button */}
                                    <button
                                        type="button"
                                        className="flex items-center justify-center h-10 w-10 rounded-lg text-text-muted dark:text-gray-500 hover:bg-muted-light dark:hover:bg-muted-dark hover:text-primary transition-colors shrink-0"
                                        aria-label="Add attachment"
                                        tabIndex={-1}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>

                                    <div className="flex-1 min-w-0 rounded-xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex items-end">
                                        <textarea
                                            ref={inputRef}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Type a message or create a new offer..."
                                            rows={1}
                                            maxLength={2000}
                                            className="flex-1 resize-none border-none bg-transparent focus:outline-none focus:ring-0 text-sm text-text-main dark:text-white placeholder:text-text-muted dark:placeholder:text-gray-500 px-3.5 py-2.5 leading-relaxed"
                                            style={{ minHeight: '42px', maxHeight: '120px' }}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                                            }}
                                        />
                                        <div className="flex items-center px-1 gap-0.5 shrink-0">
                                            <button
                                                type="button"
                                                className="flex items-center justify-center h-10 w-10 text-text-muted dark:text-gray-500 hover:text-primary transition-colors"
                                                aria-label="Emoji"
                                                tabIndex={-1}
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </button>
                                            <button
                                                type="button"
                                                className="flex items-center justify-center h-10 w-10 text-text-muted dark:text-gray-500 hover:text-primary transition-colors"
                                                aria-label="Attach file"
                                                tabIndex={-1}
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSend}
                                        disabled={!inputValue.trim()}
                                        className="flex items-center justify-center h-11 w-11 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg"
                                        aria-label="Send message"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Quick actions */}
                                <div className="flex items-center gap-4 text-xs font-bold text-text-muted dark:text-gray-400 pl-1">
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors text-primary"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Create Session Offer
                                    </button>
                                    <span className="text-gray-300 dark:text-gray-700">|</span>
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Share Exercises
                                    </button>
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] text-text-muted dark:text-gray-500">
                                        Enter to send &middot; Shift+Enter for new line
                                    </span>
                                    <span className="text-[10px] text-text-muted dark:text-gray-500">
                                        {inputValue.length}/2000
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            {/* ─── Right Panel: Context Sidebar ───────────────────────────── */}
            <aside
                className={`hidden lg:flex w-72 shrink-0 flex-col border-l border-border-light dark:border-border-dark bg-background-light/30 dark:bg-background-dark/50 p-6 ${selectedConversation ? '' : 'lg:hidden'
                    }`}
            >
                {selectedConversation && (
                    <RightSidebar selectedConversation={selectedConversation} />
                )}
            </aside>
        </div>
    );
}