"use client";

import Link from "next/link";
import { useConversationContext } from "@/hooks/useMessages";
import { getDisplayName, getPhotoUrl, getContextBadge } from "@/utils/messages";
import { RightSidebarSkeleton } from "@/components/shared/messages";
import UserAvatar from "@/components/ui/UserAvatar";

export default function TherapistRightSidebar({ selectedConversation }) {
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
                <UserAvatar
                    name={name}
                    photoUrl={getPhotoUrl(otherUser)}
                    size="xl"
                    className="border-4 border-card-light dark:border-card-dark shadow-md rounded-full"
                />
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