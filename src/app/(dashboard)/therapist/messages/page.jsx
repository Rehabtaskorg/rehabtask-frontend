'use client';

import Link from "next/link";
import { useMessagesPage } from "@/hooks/useMessagesPage";
import { ConversationList, ChatHeader, ChatThread, MessageInput } from "@/components/shared/messages";
import TherapistRightSidebar from "./TherapistRightSidebar";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import LockedPageOverlay from "@/components/therapist/LockedPageOverlay";

const THERAPIST_FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'offers', label: 'Active Offers' },
];

const therapistFilterFn = (conversation, filterKey) => {
    if (filterKey === 'all') return true;
    if (filterKey === 'unread') return conversation.unreadCount > 0;
    if (filterKey === 'offers') return conversation.currentContext?.type === 'offer';
    return true;
};

export default function TherapistMessagesPage() {
    const { canAccessMarketplace } = useTherapistAccess();
    if (!canAccessMarketplace) return <LockedPageOverlay pageType="messages" />;
    return <TherapistMessagesContent />;
}

function TherapistMessagesContent() {
    usePageTitle("Messages");
    const {
        user, conversations, messages, selected, selectedConversation,
        convLoading, convError, convSessionExpired, msgLoading, msgError,
        mobileView, inputValue, setInputValue,
        hasMore, loadOlderMessages, loadingMore,
        handleSelectConversation, handleBackToList, handleSendMessage, retryMessage
    } = useMessagesPage("/therapist/messages");

    const headerActions = (
        <>
            {selected?.contextType === 'booking' && (
                <Link href={`/therapist/bookings/${selected.contextId}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    View Booking
                </Link>
            )}
            {selected?.contextType === 'offer' && (
                <Link href="/therapist/offers" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white text-xs font-bold hover:bg-muted-light dark:hover:bg-muted-dark transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Offer
                </Link>
            )}
        </>
    )

    return (
        <div className="flex h-[calc(100vh-112px)] min-h-125 rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
            {/* Left Panel */}
            <aside className={`w-full md:w-80 shrink-0 flex flex-col border-r border-border-light dark:border-border-dark bg-background-light/30 dark:bg-background-dark/50 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                <ConversationList
                    conversations={conversations}
                    loading={convLoading}
                    error={convError}
                    sessionExpired={convSessionExpired}
                    selected={selected}
                    onSelect={handleSelectConversation}
                    filters={THERAPIST_FILTERS}
                    filterFn={therapistFilterFn}
                    subtitle="Your patient conversations"
                    emptyDescription="Your conversations will appear here once you start messaging customers."
                />
            </aside>

            {/* Center Panel */}
            <section className={`flex-1 flex flex-col min-w-0 bg-card-light dark:bg-card-dark ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
                {!selected ? (
                    <ChatThread.NoConversationSelected />
                ) : (
                    <>
                        <ChatHeader selected={selected} selectedConversation={selectedConversation} onBack={handleBackToList} headerActions={headerActions} />
                        <ChatThread
                            messages={messages}
                            loading={msgLoading}
                            error={msgError}
                            currentUser={user}
                            retryMessage={retryMessage}
                            threadId={selected?.conversationId}
                            hasMore={hasMore}
                            loadOlderMessages={loadOlderMessages}
                            loadingMore={loadingMore}
                        />
                        <MessageInput
                            inputValue={inputValue}
                            setInputValue={setInputValue}
                            onSend={handleSendMessage}
                            placeholder="Type a message..."
                        />
                    </>
                )}
            </section>

            {/* Right Panel */}
            <aside className={`hidden lg:flex w-72 shrink-0 flex-col border-l border-border-light dark:border-border-dark bg-background-light/30 dark:bg-background-dark/50 p-6 ${selectedConversation ? '' : 'lg:hidden'}`}>
                {selectedConversation && <TherapistRightSidebar selectedConversation={selectedConversation} />}
            </aside>
        </div>
    );
}