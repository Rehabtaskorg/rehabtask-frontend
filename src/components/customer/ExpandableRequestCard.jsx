"use client";

import { useState } from "react";
import {
    MdLocationOn, MdCalendarToday, MdSchedule, MdExpandMore,
    MdEdit, MdOpenInNew, MdCancel, MdVisibility, MdRefresh,
} from "react-icons/md";
import PatientBadge from "@/components/customer/PatientBadge";
import RequestOfferCard from "@/components/customer/RequestOfferCard";

// ─── Helpers ────────────────────────────────────────────────

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const getServiceTypeStyle = (serviceType) => {
    const st = serviceType?.toLowerCase() || "";
    if (st.includes("physical") || st.includes("pt"))
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (st.includes("occupational") || st.includes("ot"))
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    if (st.includes("speech") || st.includes("slp"))
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
};

const STATUS_BADGE = {
    created: { bg: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400", label: "Open" },
    offers_received: { bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400", label: "Offers Received" },
    offers_accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400", label: "Accepted" },
    completed: { bg: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400", label: "Completed" },
    cancelled: { bg: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400", label: "Cancelled" },
};

const INITIAL_OFFERS_SHOWN = 2;

export default function ExpandableRequestCard({
    request,
    isExpanded,
    onToggle,
    accepting,
    declining,
    changeOfferId,
    changeNote,
    changingOffer,
    onAccept,
    onDecline,
    onRequestChange,
    onOpenChange,
    onCloseChange,
    onChangeNoteUpdate,
    showCancelConfirm,
    cancelling,
    onCancelRequest,
    onOpenCancel,
    onCloseCancel,
}) {
    const [showAllOffers, setShowAllOffers] = useState(false);

    const badge = STATUS_BADGE[request.status] || STATUS_BADGE.created;
    const offers = request.offers || [];
    const offerCount = offers.length;
    const now = new Date();
    const pendingOffers = offers.filter((o) => o.status === "pending" && (!o.expiresAt || new Date(o.expiresAt) > now));
    const expiredPendingOffers = offers.filter((o) => o.status === "pending" && o.expiresAt && new Date(o.expiresAt) <= now);
    const otherOffers = [...offers.filter((o) => o.status !== "pending"), ...expiredPendingOffers];
    const allSorted = [...pendingOffers, ...otherOffers];
    const visibleOffers = showAllOffers ? allSorted : allSorted.slice(0, INITIAL_OFFERS_SHOWN);
    const hasMoreOffers = allSorted.length > INITIAL_OFFERS_SHOWN && !showAllOffers;

    return (
        <div
            className={`bg-white dark:bg-card-dark rounded-xl border transition-all duration-200 ${
                isExpanded
                    ? "border-l-4 border-l-primary border-primary/20 shadow-md"
                    : "border-border-light dark:border-border-dark hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
            }`}
        >
            {/* ── Collapsed Header (always visible, clickable) ── */}
            <button
                onClick={onToggle}
                className="w-full text-left p-5 sm:p-6"
            >
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getServiceTypeStyle(request.serviceType)}`}>
                            {request.serviceType}
                        </span>
                        {offerCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300">
                                {offerCount} Offer{offerCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badge.bg}`}>
                            {badge.label}
                        </span>
                        <MdExpandMore className={`text-xl text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                </div>

                <p className={`text-sm font-semibold text-text-main dark:text-white mb-2 ${isExpanded ? "" : "line-clamp-1"}`}>
                    {request.description || request.serviceType}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted dark:text-gray-400 mb-2">
                    {request.location && (
                        <span className="flex items-center gap-1">
                            <MdLocationOn className="text-sm" />
                            {request.location}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <MdCalendarToday className="text-sm" />
                        {formatDate(request.preferredDate)}
                    </span>
                    {request.visitsPerWeek && request.numberOfWeeks && (
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                            <MdRefresh className="text-sm" />
                            {request.visitsPerWeek}x/week · {request.numberOfWeeks} wk
                        </span>
                    )}
                </div>

                <PatientBadge patient={request.patient} />
            </button>

            {/* ── Expanded Content ── */}
            {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 border-t border-border-light dark:border-border-dark">
                    {/* Full description */}
                    {request.description && (
                        <div className="mt-5 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-400 mb-1">Description</p>
                            <p className="text-sm text-text-main dark:text-gray-300 leading-relaxed">{request.description}</p>
                        </div>
                    )}

                    {/* Metadata grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                        {request.preferredDate && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0">
                                    <MdCalendarToday className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-500">Preferred Date</p>
                                    <p className="text-sm font-semibold text-text-main dark:text-white">{formatDate(request.preferredDate)}</p>
                                </div>
                            </div>
                        )}
                        {request.location && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0">
                                    <MdLocationOn className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-500">Location</p>
                                    <p className="text-sm font-semibold text-text-main dark:text-white">{request.location}</p>
                                </div>
                            </div>
                        )}
                        {request.visitType && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0">
                                    <MdVisibility className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-500">Visit Type</p>
                                    <p className="text-sm font-semibold text-text-main dark:text-white">{request.visitType}</p>
                                </div>
                            </div>
                        )}
                        {request.emr && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0">
                                    <MdOpenInNew className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-500">EMR System</p>
                                    <p className="text-sm font-semibold text-text-main dark:text-white">{request.emr}</p>
                                </div>
                            </div>
                        )}
                        {request.visitsPerWeek && request.numberOfWeeks && (
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary shrink-0">
                                    <MdSchedule className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-500">Frequency</p>
                                    <p className="text-sm font-semibold text-text-main dark:text-white">
                                        {request.visitsPerWeek}x/week · {request.numberOfWeeks} weeks ({request.visitsPerWeek * request.numberOfWeeks} visits)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action links */}
                    <div className="flex flex-wrap items-center gap-4 mt-5">
                        {["created", "offers_received"].includes(request.status) && (
                            <a
                                href={`/customer/requests/new?edit=${request.id}`}
                                className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                            >
                                <MdEdit className="text-base" />
                                Edit Request
                            </a>
                        )}
                        <a
                            href={`/customer/requests/${request.id}`}
                            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            <MdOpenInNew className="text-base" />
                            View Full Details
                        </a>
                        {["created", "offers_received"].includes(request.status) && !showCancelConfirm && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onOpenCancel(); }}
                                className="inline-flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                            >
                                <MdCancel className="text-base" />
                                Cancel Request
                            </button>
                        )}
                    </div>

                    {/* Cancel confirmation */}
                    {showCancelConfirm && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm font-bold text-red-800 dark:text-red-200 mb-1">Cancel this request?</p>
                            <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                                {offerCount > 0
                                    ? `This will withdraw ${pendingOffers.length} pending offer(s) and notify therapists.`
                                    : "This action cannot be undone."}
                            </p>
                            <div className="flex gap-2 justify-end">
                                <button onClick={(e) => { e.stopPropagation(); onCloseCancel(); }} className="text-sm text-slate-500 font-bold px-3 py-1.5">
                                    Go Back
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onCancelRequest(); }}
                                    disabled={cancelling}
                                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                                >
                                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Offers Section ── */}
                    <div className="mt-6">
                        <div className="flex items-center gap-3 mb-4">
                            <h4 className="text-sm font-bold text-text-main dark:text-white">
                                Offers ({offerCount})
                            </h4>
                            <div className="h-px flex-1 bg-border-light dark:bg-border-dark" />
                        </div>

                        {offerCount === 0 ? (
                            <div className="text-center py-8">
                                <MdSchedule className="text-3xl text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                                <p className="text-text-muted dark:text-gray-400 text-sm">
                                    No offers yet. Therapists in your area will be notified.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {visibleOffers.map((offer) => {
                                    const isPending = offer.status === "pending" && (!offer.expiresAt || new Date(offer.expiresAt) > now);
                                    return (
                                        <RequestOfferCard
                                            key={offer.id}
                                            offer={offer}
                                            isPending={isPending}
                                            accepting={accepting}
                                            declining={declining}
                                            changeOfferId={changeOfferId}
                                            changeNote={changeNote}
                                            changingOffer={changingOffer}
                                            onAccept={onAccept}
                                            onDecline={onDecline}
                                            onRequestChange={onRequestChange}
                                            onOpenChange={onOpenChange}
                                            onCloseChange={onCloseChange}
                                            onChangeNoteUpdate={onChangeNoteUpdate}
                                        />
                                    );
                                })}
                                {hasMoreOffers && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowAllOffers(true); }}
                                        className="w-full py-2.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Show all {allSorted.length} offers
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
