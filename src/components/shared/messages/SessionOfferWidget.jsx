"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useOfferDetails } from "@/hooks/useOffers";
import { offersApi } from "@/lib/offers";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatMessageTime } from "@/utils/messages";
import { MdCheck, MdClose, MdEdit } from "react-icons/md";

const getOfferStatusBadge = (status) => {
    switch (status) {
        case 'accepted':
            return { label: 'ACCEPTED', className: 'bg-green-500 text-white' };
        case 'rejected':
            return { label: 'DECLINED', className: 'bg-red-500 text-white' };
        case 'expired':
            return { label: 'EXPIRED', className: 'bg-gray-500 text-white' };
        case 'change_requested':
            return { label: 'CHANGE REQUESTED', className: 'bg-amber-500 text-white' };
        case 'withdrawn':
            return { label: 'WITHDRAWN', className: 'bg-gray-500 text-white' };
        default:
            return { label: 'PENDING', className: 'bg-primary text-white' };
    }
};

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

const STATUS_TEXT = {
    pending: 'Awaiting patient response',
    accepted: 'Offer accepted by patient',
    rejected: 'Offer declined by patient',
    change_requested: 'Patient requested changes to this offer',
    withdrawn: 'Offer was withdrawn by therapist',
    expired: 'Offer expired',
};

export default function SessionOfferWidget({ offerId }) {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { offer, loading, error } = useOfferDetails(offerId);

    const [actionLoading, setActionLoading] = useState(null); // 'accept' | 'decline' | 'change' | null
    const [actionError, setActionError] = useState(null);
    const [showChangeInput, setShowChangeInput] = useState(false);
    const [changeNote, setChangeNote] = useState("");

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
    const isCustomer = user?.role === "customer" && offer.request?.customer?.userId === user?.id;
    const isTherapist = user?.role === "therapist";
    const isPending = offer.status === "pending";
    const showActions = isCustomer && isPending;

    const invalidateAfterAction = () => {
        queryClient.invalidateQueries({ queryKey: ["offer", offerId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        // Invalidate messages to pick up system messages (offer_accepted, booking_created)
        queryClient.invalidateQueries({ queryKey: ["messages"] });
    };

    const handleAccept = async () => {
        if (!confirm("Accept this offer? A booking will be created and you can pay when ready.")) return;
        setActionLoading("accept");
        setActionError(null);
        try {
            await offersApi.acceptOffer(offerId);
            invalidateAfterAction();
        } catch (err) {
            const code = err.response?.data?.code;
            if (code === "THERAPIST_LIMIT_REACHED" || code === "REQUEST_LIMIT_REACHED") {
                setActionError(err.response.data.message);
            } else {
                setActionError(err.response?.data?.message || "Failed to accept offer");
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleDecline = async () => {
        if (!confirm("Decline this offer? The therapist will be notified.")) return;
        setActionLoading("decline");
        setActionError(null);
        try {
            await offersApi.declineOffer(offerId);
            invalidateAfterAction();
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to decline offer");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRequestChange = async () => {
        if (!changeNote.trim()) return;
        setActionLoading("change");
        setActionError(null);
        try {
            await offersApi.requestChange(offerId, changeNote.trim());
            setShowChangeInput(false);
            setChangeNote("");
            invalidateAfterAction();
        } catch (err) {
            const errors = err.response?.data?.errors;
            setActionError(errors?.[0]?.message || err.response?.data?.message || "Failed to send change request");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="flex flex-col items-center py-2">
            <div className="w-full max-w-sm bg-card-light dark:bg-card-dark border-2 border-primary/30 dark:border-primary/50 rounded-xl overflow-hidden shadow-lg">
                {/* Header */}
                <div className="bg-primary/10 dark:bg-primary/20 px-4 py-3 border-b border-primary/20 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h4 className="text-primary font-bold text-sm tracking-tight">Session Offer</h4>
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

                    {offer.request?.patient?.fullName && (
                        <div className="flex items-center gap-2 bg-background-light dark:bg-background-dark px-3 py-2 rounded-lg">
                            <svg className="w-4 h-4 text-text-muted dark:text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            <div>
                                <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase">Patient</p>
                                <p className="text-text-main dark:text-white text-sm font-medium">{offer.request.patient.fullName}</p>
                            </div>
                        </div>
                    )}

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

                    {offer.attemptedVisitRate != null && (
                        parseFloat(offer.attemptedVisitRate) > 0 ? (
                            <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                                    <span className="font-semibold">Not home when therapist arrives?</span>{" "}
                                    {formatCurrency(offer.attemptedVisitRate)} attempted visit fee
                                </p>
                            </div>
                        ) : (
                            <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                                    ✓ No charge for missed visits
                                </p>
                            </div>
                        )
                    )}

                    {/* Status text */}
                    <p className="text-center text-[10px] text-text-muted dark:text-gray-500 italic">
                        {STATUS_TEXT[offer.status] ?? 'Offer expired'}
                    </p>

                    {/* Error message */}
                    {actionError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                            <p className="text-xs text-red-700 dark:text-red-300">{actionError}</p>
                        </div>
                    )}

                    {/* Customer action buttons — only shown for pending offers owned by this customer */}
                    {showActions && (
                        <div className="space-y-2 pt-1">
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAccept}
                                    disabled={!!actionLoading}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading === "accept" ? (
                                        <span className="animate-pulse">Accepting...</span>
                                    ) : (
                                        <><MdCheck className="text-sm" /> Accept Offer</>
                                    )}
                                </button>
                                <button
                                    onClick={handleDecline}
                                    disabled={!!actionLoading}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading === "decline" ? (
                                        <span className="animate-pulse">Declining...</span>
                                    ) : (
                                        <><MdClose className="text-sm" /> Decline</>
                                    )}
                                </button>
                            </div>

                            {!showChangeInput ? (
                                <button
                                    onClick={() => setShowChangeInput(true)}
                                    disabled={!!actionLoading}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors disabled:opacity-50"
                                >
                                    <MdEdit className="text-sm" /> Request Changes
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <textarea
                                        value={changeNote}
                                        onChange={(e) => setChangeNote(e.target.value)}
                                        placeholder="Describe the changes you'd like..."
                                        maxLength={500}
                                        rows={2}
                                        className="w-full text-xs bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none resize-none text-text-main dark:text-white placeholder:text-text-muted"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleRequestChange}
                                            disabled={!changeNote.trim() || !!actionLoading}
                                            className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {actionLoading === "change" ? "Sending..." : "Send Request"}
                                        </button>
                                        <button
                                            onClick={() => { setShowChangeInput(false); setChangeNote(""); }}
                                            disabled={!!actionLoading}
                                            className="px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-main dark:hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Therapist: link to offer detail in My Offers */}
                    {isTherapist && (
                        <Link
                            href="/therapist/offers"
                            className="block w-full text-center text-[11px] font-semibold text-primary hover:underline pt-1"
                        >
                            View in My Offers →
                        </Link>
                    )}
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
