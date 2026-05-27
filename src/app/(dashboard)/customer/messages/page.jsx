'use client';

import { useState } from "react";
import Link from "next/link";
import { useConversationContext } from "@/hooks/useMessages";
import { useMessagesPage } from "@/hooks/useMessagesPage";
import { useAnalytics } from "@/hooks/useAnalytics";
import { getDisplayName, getPhotoUrl, getContextBadge } from "@/utils/messages";
import { RightSidebarSkeleton } from "@/components/shared/messages";
import { ConversationList, ChatHeader, ChatThread, MessageInput } from "@/components/shared/messages";
import SharedFiles from "@/components/shared/messages/SharedFiles";
import AttachmentsModal from "@/components/shared/messages/AttachmentsModal";
import UserAvatar from "@/components/ui/UserAvatar";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MdSend } from "react-icons/md";

function CustomerRightSidebar({ selectedConversation }) {
    // Use the conversationId (always a DirectConversation) for API context resolution
    const convId = selectedConversation?.conversationId || selectedConversation?.directConversationId;
    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
    const { trackEvent } = useAnalytics();

    // Display type: actual conversation context (booking/offer/direct) for UI labels and links
    const displayContextType = selectedConversation?.currentContext?.type ?? 'direct';
    const displayContextId = selectedConversation?.currentContext?.id;

    const { otherUser: contextOtherUser, patient: contextPatient, loading: contextLoading } =
        useConversationContext(convId ? 'direct' : null, convId);

    const otherUser = selectedConversation?.otherUser || contextOtherUser;
    // Prefer contextPatient (from API, has full details like email) over conversation list patient
    const patient = contextPatient || selectedConversation?.patient;
    const name = otherUser ? getDisplayName(otherUser) : 'Unknown';
    const badge = getContextBadge(displayContextType);
    const specialization = otherUser?.therapistProfile?.specialization || otherUser?.specialization || null;
    const yearsExp = otherUser?.therapistProfile?.yearsOfExperience || otherUser?.yearsOfExperience || null;

    if (contextLoading && !otherUser) return <RightSidebarSkeleton />;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col items-center text-center gap-3">
                <UserAvatar
                    name={name}
                    photoUrl={getPhotoUrl(otherUser)}
                    size="xl"
                    className="border-4 border-card-light  shadow-md rounded-full"
                />
                <div>
                    <h4 className="text-text-main  text-base font-bold">{name}</h4>
                    {badge && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
            </div>

            {(specialization || yearsExp) && (
                <div className="mt-6 space-y-2">
                    <p className="text-text-muted  text-[10px] font-bold uppercase tracking-widest">Therapist Info</p>
                    {specialization && (
                        <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            <p className="text-text-main  text-sm">{specialization}</p>
                        </div>
                    )}
                    {yearsExp && (
                        <div className="flex items-center gap-2">
                            <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-text-main  text-sm">{yearsExp} years experience</p>
                        </div>
                    )}
                </div>
            )}

            {patient && (
                <div className="mt-4 space-y-1">
                    <p className="text-text-muted  text-[10px] font-bold uppercase tracking-widest">Patient</p>
                    <p className="text-text-main  text-sm font-medium">{patient.fullName}</p>
                    {patient.email && (
                        <p className="text-text-muted  text-xs">{patient.email}</p>
                    )}
                </div>
            )}

            <div className="mt-4 space-y-1">
                <p className="text-text-muted  text-[10px] font-bold uppercase tracking-widest">Context</p>
                {displayContextType === 'booking' ? (
                    <Link href={`/customer/bookings/${displayContextId}`} className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        View Booking
                    </Link>
                ) : displayContextType === 'direct' ? (
                    <p className="text-text-main  text-sm">Direct Message</p>
                ) : (
                    <p className="text-text-main  text-sm">Request Conversation</p>
                )}
            </div>

            {/* Direct request CTA — shown on all conversation types with a known therapist */}
            {otherUser?.role === 'therapist' && (otherUser?.therapistProfile?.id || otherUser?.id) && (
                <div className="mt-4 space-y-2">
                    <p className="text-text-muted  text-[10px] font-bold uppercase tracking-widest">Actions</p>
                    <Link
                        href={`/customer/requests/new?directTo=${otherUser.therapistProfile?.id || otherUser.id}`}
                        onClick={() => trackEvent("direct_request_initiated", { source: "messages_sidebar" })}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <MdSend className="text-base" />
                        Create Direct Request
                    </Link>
                </div>
            )}

            {displayContextType === 'booking' && (() => {
                const bookingStatus = selectedConversation?.currentContext?.data?.status;
                const isUpcoming = ["accepted", "confirmed", "in_progress"].includes(bookingStatus);
                const isCompleted = bookingStatus === "completed";
                const isCancelled = bookingStatus === "cancelled";

                if (isCancelled) return null;

                return (
                    <div className="mt-4 space-y-2">
                        <p className="text-text-muted  text-[10px] font-bold uppercase tracking-widest">
                            {isCompleted ? "Session Complete" : "Upcoming Session"}
                        </p>
                        <div className={`p-3 rounded-lg border ${isCompleted
                            ? "bg-emerald-50  border-emerald-200 "
                            : "bg-primary/5  border-primary/20"
                        }`}>
                            <p className={`text-[10px] font-bold ${isCompleted ? "text-emerald-600 " : "text-primary"}`}>
                                {isCompleted ? "COMPLETED" : isUpcoming ? "NEXT SESSION" : "PENDING"}
                            </p>
                            <p className="text-xs text-text-main  font-bold mt-1">
                                {isCompleted ? "Session completed successfully" : "View booking for details"}
                            </p>
                            <Link href={`/customer/bookings/${displayContextId}`} className="text-[10px] text-primary font-medium hover:underline mt-1 inline-block">
                                Go to booking →
                            </Link>
                        </div>
                    </div>
                );
            })()}

            {/* Shared files */}
            {convId && <SharedFiles conversationId={convId} onViewAll={() => setShowAttachmentsModal(true)} />}

            {/* Attachments modal */}
            <AttachmentsModal
                isOpen={showAttachmentsModal}
                onClose={() => setShowAttachmentsModal(false)}
                conversationId={convId}
            />
        </div>
    );
}

export default function CustomerMessagesPage() {
    usePageTitle("Messages");
    const {
        user, conversations, messages, selected, selectedConversation,
        convLoading, convError, convSessionExpired, msgLoading, msgError,
        mobileView, inputValue, setInputValue, uploading, replyingTo, setReplyingTo, scrollTrigger,
        hasMore, loadOlderMessages, loadingMore,
        handleSelectConversation, handleBackToList, handleSendMessage, retryMessage,
    } = useMessagesPage("/customer/messages");

    const headerActions = selected?.contextType === "booking" ? (
        <Link href={`/customer/bookings/${selected.contextId}`} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            View Booking
        </Link>
    ) : null;

    return (
        <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-112px)] min-h-125 rounded-xl border border-border-light  overflow-hidden shadow-sm">
            {/* Left Panel */}
            <aside className={`w-full md:w-80 shrink-0 flex flex-col border-r border-border-light  bg-background-light/30  ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
                <ConversationList
                    conversations={conversations}
                    loading={convLoading}
                    error={convError}
                    sessionExpired={convSessionExpired}
                    selected={selected}
                    onSelect={handleSelectConversation}
                    subtitle="Your therapist conversations"
                    emptyDescription="Your conversations with therapists will appear here once messaging begins."
                />
            </aside>

            {/* Center Panel */}
            <section className={`flex-1 flex flex-col min-w-0 bg-card-light  ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
                {!selected ? (
                    <ChatThread.NoConversationSelected />
                ) : (
                    <>
                        <ChatHeader selected={selected} selectedConversation={selectedConversation} onBack={handleBackToList} headerActions={headerActions} />
                        <ChatThread messages={messages} loading={msgLoading} error={msgError} currentUser={user} retryMessage={retryMessage} onReply={setReplyingTo} threadId={selected?.conversationId} hasMore={hasMore} loadOlderMessages={loadOlderMessages} loadingMore={loadingMore} scrollTrigger={scrollTrigger} />
                        <MessageInput inputValue={inputValue} setInputValue={setInputValue} onSend={handleSendMessage} uploading={uploading} replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />
                    </>
                )}
            </section>

            {/* Right Panel */}
            <aside className={`hidden lg:flex w-72 shrink-0 flex-col border-l border-border-light  bg-background-light/30  overflow-y-auto ${selectedConversation ? '' : 'lg:hidden'}`}>
                {selectedConversation && (
                    <div className="p-6">
                        <CustomerRightSidebar selectedConversation={selectedConversation} />
                    </div>
                )}
            </aside>
        </div>
    );
}