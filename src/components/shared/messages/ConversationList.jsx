"use client";

import { useState } from "react";
import { getDisplayName } from "@/utils/messages";
import { ConversationSkeleton } from "./Skeletons";
import ConversationListItem from "./ConversationListItem";

/**
 * @param {Object} props
 * @param {Array}  props.conversations
 * @param {boolean} props.loading
 * @param {string|null} props.error
 * @param {boolean} props.sessionExpired
 * @param {Object|null} props.selected - { type, id }
 * @param {Function} props.onSelect
 * @param {Array<{key:string, label:string}>} props.filters - e.g. [{ key:'all', label:'All' }, ...]
 * @param {Function} props.filterFn - (conversation, filterKey) => boolean
 * @param {string} props.emptyTitle
 * @param {string} props.emptyDescription
 * @param {string} props.subtitle
 * @param {React.ReactNode} [props.headerExtra] - extra content in header (e.g. "New" button)
 */
export default function ConversationList({
    conversations,
    loading,
    error,
    sessionExpired,
    selected,
    onSelect,
    filters = [{ key: 'all', label: 'All' }, { key: 'unread', label: 'Unread' }],
    filterFn,
    emptyTitle = 'No conversations yet',
    emptyDescription = 'Your conversations will appear here once messaging begins.',
    subtitle = 'Your conversations',
    headerExtra,
}) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = conversations.filter((c) => {
        const nameMatch = !search.trim() || getDisplayName(c.otherUser).toLowerCase().includes(search.toLowerCase());
        const filterMatch = filterFn ? filterFn(c, filter) : (filter === 'all' || (filter === 'unread' && c.unreadCount > 0));
        return nameMatch && filterMatch;
    });

    return (
        <>
            <div className="p-4 border-b border-border-light  flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-base font-bold text-text-main ">Conversations</h1>
                        <p className="text-xs text-text-muted ">
                            {!loading && conversations.length > 0
                                ? `${conversations.length} active conversation${conversations.length !== 1 ? 's' : ''}`
                                : subtitle}
                        </p>
                    </div>
                    {headerExtra}
                </div>

                <div className="flex items-stretch rounded-lg border border-border-light  overflow-hidden h-9">
                    <div className="flex items-center justify-center px-3 bg-card-light  text-text-muted  shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 bg-card-light  text-sm text-text-main  placeholder:text-text-muted  px-3 focus:outline-none border-none min-w-0"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto">
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${filter === f.key ? 'bg-primary text-white' : 'bg-muted-light  text-text-main  hover:bg-primary/10 '}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <>{[1, 2, 3, 4].map((i) => <ConversationSkeleton key={i} />)}</>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-red-100  flex items-center justify-center mb-3">
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-text-muted  text-sm">
                            {sessionExpired
                                ? "Unable to load conversations. Your session may have expired."
                                : error}
                        </p>
                        {sessionExpired && (
                            <a href="/login" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors">
                                Log in again
                            </a>
                        )}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h3 className="font-semibold text-text-main  mb-1 text-sm">{emptyTitle}</h3>
                        <p className="text-text-muted  text-xs max-w-50">{emptyDescription}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-12 px-4 text-center">
                        <p className="text-text-muted  text-sm">
                            {search.trim() ? `No results for "${search}"` : 'No matching conversations'}
                        </p>
                    </div>
                ) : (
                    <ul>
                        {filtered.map((conversation, idx) => (
                            <ConversationListItem
                                key={conversation.conversationId || `conv-${idx}`}
                                conversation={conversation}
                                isSelected={selected?.conversationId === conversation.conversationId}
                                onSelect={onSelect}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </>
    )

}