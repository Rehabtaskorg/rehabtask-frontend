"use client";

import { MdCalendarToday } from "react-icons/md";
import UserAvatar from "@/components/ui/UserAvatar";

const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} • ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
};

const formatSessionType = (type) => {
    if (!type) return "—";
    return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const OFFER_STATUS_BADGE = {
    pending: { bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400", label: "Pending" },
    accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400", label: "Accepted" },
    rejected: { bg: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400", label: "Declined" },
    expired: { bg: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400", label: "Expired" },
    withdrawn: { bg: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400", label: "Withdrawn" },
    change_requested: { bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400", label: "Change Requested" },
};

export default function RequestOfferCard({
    offer,
    isPending,
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
}) {
    const therapist = offer.therapist;
    const isClientExpired = offer.status === "pending" && offer.expiresAt && new Date(offer.expiresAt) <= new Date();
    const displayStatus = isClientExpired ? "expired" : offer.status;
    const offerBadge = OFFER_STATUS_BADGE[displayStatus] || OFFER_STATUS_BADGE.pending;

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-4">
            {/* Top row: avatar + info + rate */}
            <div className="flex items-start gap-3">
                <UserAvatar
                    name={therapist?.fullName || "Therapist"}
                    photoUrl={therapist?.profilePhotoUrl}
                    size="lg"
                    className="rounded-xl"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white">
                                {therapist?.fullName || "Therapist"}
                            </h4>
                            {therapist?.specialization && (
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                    {therapist.specialization}
                                </p>
                            )}
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-primary dark:text-blue-400 font-mono">
                                ${parseFloat(offer.rate).toFixed(2)}
                                <span className="text-xs text-text-muted dark:text-gray-400 font-sans font-normal">/session</span>
                            </p>
                            {offer.sessionType && (
                                <span className="text-[10px] font-medium text-text-muted dark:text-gray-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                                    {formatSessionType(offer.sessionType)}
                                </span>
                            )}
                            {offer.visitType && (
                                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                                    {offer.visitType.name} ({offer.visitType.code})
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposed date */}
            {offer.proposedDate && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mt-3 text-xs text-text-muted dark:text-gray-400 flex items-center gap-1.5">
                    <MdCalendarToday className="text-sm" />
                    Proposed: {formatDateTime(offer.proposedDate)}
                </div>
            )}

            {/* Offer description */}
            {offer.description && (
                <p className="text-xs text-text-muted dark:text-gray-400 mt-2 leading-relaxed line-clamp-2">
                    {offer.description}
                </p>
            )}

            {/* Status badge — show for non-pending OR client-side expired */}
            {(!isPending || isClientExpired) && (
                <div className="mt-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${offerBadge.bg}`}>
                        {offerBadge.label}
                    </span>
                    {isClientExpired && offer.expiresAt && (
                        <p className="text-xs text-text-muted dark:text-gray-400 mt-1.5">
                            Expired {formatDateTime(offer.expiresAt)}. The therapist can submit a new offer if still interested.
                        </p>
                    )}
                </div>
            )}

            {/* Action buttons (pending and not expired only) */}
            {isPending && !isClientExpired && (
                <div className="flex items-center gap-2 mt-4">
                    <button
                        onClick={() => onAccept(offer.id)}
                        disabled={accepting === offer.id}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {accepting === offer.id ? "Accepting..." : "Accept Offer"}
                    </button>
                    <button
                        onClick={() => onDecline(offer.id)}
                        disabled={declining === offer.id}
                        className="px-4 border border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                    >
                        {declining === offer.id ? "..." : "Decline"}
                    </button>
                    <button
                        onClick={() => onOpenChange(offer.id)}
                        className="px-4 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                        Request Change
                    </button>
                </div>
            )}

            {/* Inline change request form */}
            {isPending && !isClientExpired && changeOfferId === offer.id && (
                <div className="mt-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-2">
                        What would you like to change?
                    </label>
                    <textarea
                        rows={2}
                        value={changeNote}
                        onChange={(e) => onChangeNoteUpdate(e.target.value)}
                        className="w-full text-sm rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 p-2 focus:ring-primary focus:outline-none resize-none text-text-main dark:text-white"
                        placeholder="Describe what you'd like changed..."
                    />
                    <p className={`text-xs mt-1 ${changeNote.trim().length > 0 && changeNote.trim().length < 10 ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>
                        {changeNote.trim().length > 0 && changeNote.trim().length < 10
                            ? `${10 - changeNote.trim().length} more characters needed`
                            : "Min 10 characters"}
                    </p>
                    <div className="flex gap-2 mt-2 justify-end">
                        <button onClick={onCloseChange} className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={() => onRequestChange(offer.id)}
                            disabled={changeNote.trim().length < 10 || changingOffer}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                        >
                            {changingOffer ? "Sending..." : "Send"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
