"use client";

import { useOfferDetails } from "@/hooks/useOffers";
import { formatCurrency, formatMessageTime } from "@/utils/messages";

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

export default function SessionOfferWidget({ offerId }) {
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

    if (error || !offer) {
        if (error) console.warn(`[SessionOfferWidget] Failed to load offer ${offerId}`);
        return null;
    }

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
