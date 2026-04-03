"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useConversationContext } from "@/hooks/useMessages";
import { getDisplayName, getPhotoUrl, getContextBadge } from "@/utils/messages";
import { RightSidebarSkeleton } from "@/components/shared/messages";
import UserAvatar from "@/components/ui/UserAvatar";
import { MdDescription, MdLocationOn, MdCalendarToday, MdArrowForward, MdCheckCircle } from "react-icons/md";

export default function TherapistRightSidebar({ selectedConversation }) {
    // Use the conversationId (always a DirectConversation) for API context resolution
    const convId = selectedConversation?.conversationId || selectedConversation?.directConversationId;

    // Display type: actual conversation context (booking/offer/direct) for UI labels and links
    const displayContextType = selectedConversation?.currentContext?.type ?? 'direct';
    const displayContextId = selectedConversation?.currentContext?.id;

    const { otherUser: contextOtherUser, patient: contextPatient, loading: contextLoading } = useConversationContext(
        convId ? 'direct' : null,
        convId
    );

    const otherUser = selectedConversation?.otherUser || contextOtherUser;
    const patient = contextPatient || selectedConversation?.patient;
    const name = otherUser ? getDisplayName(otherUser) : 'Unknown';
    const badge = getContextBadge(displayContextType);

    // Fetch customer's open requests when viewing a direct conversation
    const otherUserId = otherUser?.id;
    const isCustomerConversation = otherUser?.role === "customer";
    const [customerRequests, setCustomerRequests] = useState([]);
    const [requestsLoading, setRequestsLoading] = useState(false);

    useEffect(() => {
        if (!otherUserId || !isCustomerConversation) {
            setCustomerRequests([]);
            return;
        }

        let cancelled = false;
        setRequestsLoading(true);

        api.get(`/requests/by-customer/${otherUserId}`)
            .then((res) => {
                if (!cancelled) setCustomerRequests(res.data.data || []);
            })
            .catch(() => {
                if (!cancelled) setCustomerRequests([]);
            })
            .finally(() => {
                if (!cancelled) setRequestsLoading(false);
            });

        return () => { cancelled = true; };
    }, [otherUserId, isCustomerConversation]);

    if (contextLoading && !otherUser) {
        return <RightSidebarSkeleton />;
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto">
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
                    {badge && (
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                            {badge.label}
                        </span>
                    )}
                </div>
            </div>

            {/* Patient info */}
            {patient && (
                <div className="mt-6 space-y-1">
                    <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Patient Info</p>
                    <p className="text-text-main dark:text-white text-sm font-medium">{patient.fullName}</p>
                    {patient.email && (
                        <p className="text-text-muted dark:text-gray-400 text-xs">{patient.email}</p>
                    )}
                </div>
            )}

            {/* Context details */}
            <div className="mt-4 space-y-1">
                <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">Context</p>
                {displayContextType === 'booking' ? (
                    <Link
                        href={`/therapist/bookings/${displayContextId}`}
                        className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Booking
                    </Link>
                ) : displayContextType === 'offer' ? (
                    <p className="text-text-main dark:text-white text-sm">Offer Conversation</p>
                ) : (
                    <p className="text-text-main dark:text-white text-sm">Direct Message</p>
                )}
            </div>

            {/* Session status (for bookings — context-aware) */}
            {displayContextType === 'booking' && (() => {
                const bookingStatus = selectedConversation?.currentContext?.data?.status;
                const isUpcoming = ["accepted", "confirmed", "in_progress"].includes(bookingStatus);
                const isCompleted = bookingStatus === "completed";
                const isCancelled = bookingStatus === "cancelled";

                if (isCancelled) return null; // Don't show anything for cancelled bookings

                return (
                    <div className="mt-4 space-y-2">
                        <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            {isCompleted ? "Session Complete" : "Upcoming Session"}
                        </p>
                        <div className={`p-3 rounded-lg border ${isCompleted
                            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                            : "bg-primary/5 dark:bg-primary/10 border-primary/20"
                        }`}>
                            <p className={`text-[10px] font-bold ${isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}>
                                {isCompleted ? "COMPLETED" : isUpcoming ? "NEXT SESSION" : "PENDING"}
                            </p>
                            <p className="text-xs text-text-main dark:text-white font-bold mt-1">
                                {isCompleted ? "Session completed successfully" : "View booking for details"}
                            </p>
                            <Link
                                href={`/therapist/bookings/${displayContextId}`}
                                className="text-[10px] text-primary font-medium hover:underline mt-1 inline-block"
                            >
                                Go to booking →
                            </Link>
                        </div>
                    </div>
                );
            })()}

            {/* Customer's open requests — shown when chatting with a customer */}
            {isCustomerConversation && (
                <div className="mt-6 space-y-2">
                    <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        Open Requests
                    </p>

                    {requestsLoading ? (
                        <div className="space-y-2">
                            {[1, 2].map(i => (
                                <div key={i} className="animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 p-3 space-y-2">
                                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : customerRequests.length === 0 ? (
                        <p className="text-xs text-text-muted dark:text-gray-500 italic">
                            No open requests from this customer.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {customerRequests.map((req) => (
                                <Link
                                    key={req.id}
                                    href={`/therapist/requests/${req.id}`}
                                    className="block p-3 rounded-lg border border-border-light dark:border-border-dark hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <MdDescription className="text-primary text-sm shrink-0" />
                                            <p className="text-xs font-bold text-text-main dark:text-white truncate">
                                                {req.serviceType}
                                            </p>
                                        </div>
                                        <MdArrowForward className="text-xs text-slate-400 group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                                    </div>

                                    {req.location && (
                                        <p className="text-[10px] text-text-muted dark:text-gray-400 flex items-center gap-1 mt-1">
                                            <MdLocationOn className="text-xs" /> {req.location}
                                        </p>
                                    )}

                                    {req.preferredDate && (
                                        <p className="text-[10px] text-text-muted dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                            <MdCalendarToday className="text-xs" />
                                            {new Date(req.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </p>
                                    )}

                                    {req.patient && (
                                        <p className="text-[10px] text-text-muted dark:text-gray-400 mt-0.5">
                                            Patient: {req.patient.fullName}
                                        </p>
                                    )}

                                    {req.myOffer ? (
                                        <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                            <MdCheckCircle className="text-xs" /> Offer sent
                                        </span>
                                    ) : (
                                        <span className="inline-block mt-1.5 text-[10px] font-bold text-primary">
                                            View & Offer →
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
