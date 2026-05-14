"use client";

import Image from "next/image";
import {
    MdAttachMoney, MdCalendarToday, MdVideocam, MdPersonPin, MdInfo,
} from "react-icons/md";
import { resolveVisitPlan, hasPlanOverride, computeTotalVisits } from "@/lib/visitPlan";
import { formatDate, formatTime } from "@/utils/dates";

const OFFER_STATUS_STYLES = {
    pending:          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    accepted:         "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected:         "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    expired:          "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    withdrawn:        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    change_requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

/**
 * Offer card rendered on the customer request detail page (/customer/requests/[id]).
 * Handles accept, decline, and change-request actions inline.
 *
 * @param {Object}   props
 * @param {Object}   props.offer
 * @param {Object}   props.request            - parent request, used for visit plan diff
 * @param {string}   props.declining          - offerId currently being declined
 * @param {string}   props.changeOfferId      - offerId whose change form is open
 * @param {string}   props.changeNote
 * @param {boolean}  props.changingOffer
 * @param {Function} props.onAccept
 * @param {Function} props.onDecline
 * @param {Function} props.onOpenChange
 * @param {Function} props.onCloseChange
 * @param {Function} props.onChangeNoteUpdate
 * @param {Function} props.onRequestChange
 * @param {Function} props.onMessage
 */
export default function RequestDetailOfferCard({
    offer, request, declining, changeOfferId, changeNote,
    changingOffer, onAccept, onDecline, onOpenChange,
    onCloseChange, onChangeNoteUpdate, onRequestChange, onMessage,
}) {
    const therapist = offer.therapist || {};
    const initial = (therapist.fullName || "T").charAt(0).toUpperCase();
    const isExpired = offer.status === "pending" && offer.expiresAt && new Date(offer.expiresAt) <= new Date();
    const displayStatus = isExpired ? "expired" : offer.status;
    const isActionable = offer.status === "pending" && !isExpired;

    const effectivePlan = resolveVisitPlan({ offer, request });
    const effectiveTotalVisits = computeTotalVisits(effectivePlan);
    const showPlanDiff = hasPlanOverride(offer, request);

    return (
        <div className={`bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-border-light dark:border-border-dark transition-all ${isExpired ? "opacity-60 border-dashed" : "hover:shadow-md"}`}>
            <div className="flex flex-col md:flex-row md:items-start gap-4">
                {therapist.profilePhotoUrl ? (
                    <Image
                        src={therapist.profilePhotoUrl}
                        alt={therapist.fullName}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-xl object-cover shrink-0"
                    />
                ) : (
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                        {initial}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-bold text-text-main dark:text-white">{therapist.fullName || "Therapist"}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${OFFER_STATUS_STYLES[displayStatus]}`}>
                            {displayStatus.replace(/_/g, " ")}
                        </span>
                    </div>
                    {therapist.specialization && (
                        <p className="text-sm text-text-muted dark:text-gray-400">{therapist.specialization}</p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-muted dark:text-gray-400">
                        <span className="flex items-center gap-1 font-semibold text-text-main dark:text-white">
                            <MdAttachMoney className="text-emerald-500" />
                            ${parseFloat(offer.rate).toFixed(2)}/session
                            {effectiveTotalVisits && (
                                <span className="text-text-muted dark:text-gray-400 font-normal text-xs ml-1">
                                    (${(parseFloat(offer.rate) * effectiveTotalVisits).toFixed(2)} total)
                                </span>
                            )}
                        </span>
                        <span className="flex items-center gap-1">
                            {offer.sessionType === "virtual" ? <MdVideocam className="text-sm" /> : <MdPersonPin className="text-sm" />}
                            {offer.sessionType === "virtual" ? "Virtual" : "In-Person"}
                        </span>
                        {offer.visitTypeRef && (
                            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                {offer.visitTypeRef.name} ({offer.visitTypeRef.code})
                            </span>
                        )}
                    </div>

                    {showPlanDiff && (
                        <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-3">
                            <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <MdInfo className="text-sm" /> Proposed treatment plan
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase mb-1">Your request</p>
                                    {request.visitsPerWeek && request.numberOfWeeks && (
                                        <p className="text-text-main dark:text-white">
                                            {request.visitsPerWeek}×/week × {request.numberOfWeeks}wk
                                            <span className="text-text-muted dark:text-gray-400"> ({request.visitsPerWeek * request.numberOfWeeks} visits)</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase mb-1">Therapist proposes</p>
                                    {effectivePlan.visitType && <p className="text-text-main dark:text-white font-semibold">{effectivePlan.visitType}</p>}
                                    {effectivePlan.visitsPerWeek && effectivePlan.numberOfWeeks && (
                                        <p className="text-text-main dark:text-white font-semibold">
                                            {effectivePlan.visitsPerWeek}×/week × {effectivePlan.numberOfWeeks}wk
                                            <span className="text-text-muted dark:text-gray-400 font-normal"> ({effectivePlan.visitsPerWeek * effectivePlan.numberOfWeeks} visits)</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <p className="text-[10px] text-text-muted dark:text-gray-400 italic mt-2">
                                If you accept this offer, the therapist&apos;s plan becomes your treatment plan.
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-text-muted dark:text-gray-400 mt-2 flex items-center gap-1">
                        <MdCalendarToday className="text-sm" />
                        Proposed: {formatDate(offer.proposedDate)} · {formatTime(offer.proposedDate)}
                    </p>

                    {offer.description && (
                        <p className="text-sm text-text-main dark:text-gray-300 mt-3 leading-relaxed">{offer.description}</p>
                    )}

                    {offer.attemptedVisitRate != null && (
                        parseFloat(offer.attemptedVisitRate) > 0 ? (
                            <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                                    <span className="font-semibold">If you&apos;re not home when therapist arrives:</span>{" "}
                                    ${parseFloat(offer.attemptedVisitRate).toFixed(2)} attempted visit fee
                                </p>
                            </div>
                        ) : (
                            <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                                    No charge for missed visits
                                </p>
                            </div>
                        )
                    )}

                    {isExpired && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
                            This offer has expired. The therapist can send a new offer if still interested.
                        </p>
                    )}
                    {!isExpired && offer.expiresAt && offer.status === "pending" && (
                        <p className="text-xs text-text-muted dark:text-gray-400 mt-2">
                            Expires: {formatDate(offer.expiresAt)} · {formatTime(offer.expiresAt)}
                        </p>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            {isActionable && changeOfferId !== offer.id && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                    <button
                        onClick={() => onAccept(offer.id)}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        Accept & Fund Offer
                    </button>
                    <button
                        onClick={() => onOpenChange(offer.id)}
                        className="flex-1 sm:flex-none px-5 py-2.5 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg text-sm font-bold transition-colors"
                    >
                        Request Change
                    </button>
                    <button
                        onClick={() => onDecline(offer.id)}
                        disabled={declining === offer.id}
                        className="px-5 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                    >
                        {declining === offer.id ? "Declining..." : "Decline"}
                    </button>
                    <button
                        onClick={() => onMessage(offer.id)}
                        className="px-5 py-2.5 border border-border-light dark:border-border-dark text-text-muted dark:text-gray-400 hover:text-primary hover:border-primary rounded-lg text-sm font-bold transition-colors"
                    >
                        Message
                    </button>
                </div>
            )}

            {/* Inline change request form */}
            {isActionable && changeOfferId === offer.id && (
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <label className="text-xs font-semibold text-amber-800 dark:text-amber-300 block mb-2">
                            What would you like to change?
                        </label>
                        <textarea
                            rows={3}
                            value={changeNote}
                            onChange={(e) => onChangeNoteUpdate(e.target.value)}
                            className="w-full text-sm rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 p-3 focus:ring-primary focus:outline-none resize-none text-text-main dark:text-white"
                            placeholder="Describe what you'd like changed..."
                        />
                        <p className={`text-xs mt-1 ${changeNote.trim().length > 0 && changeNote.trim().length < 10 ? "text-red-500" : "text-slate-400 dark:text-slate-500"}`}>
                            {changeNote.trim().length > 0 && changeNote.trim().length < 10
                                ? `${10 - changeNote.trim().length} more characters needed`
                                : "Min 10 characters"}
                        </p>
                        <div className="flex gap-2 mt-3 justify-end">
                            <button
                                onClick={onCloseChange}
                                className="text-sm text-slate-500 dark:text-slate-400 font-bold hover:text-text-main dark:hover:text-white transition-colors px-3 py-1.5"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => onRequestChange(offer.id)}
                                disabled={changeNote.trim().length < 10 || changingOffer}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                            >
                                {changingOffer ? "Sending..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
