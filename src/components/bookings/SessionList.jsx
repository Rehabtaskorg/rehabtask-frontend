"use client";

import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
    MdCheckCircle, MdTimer, MdCancel,
    MdCalendarToday, MdSchedule, MdTaskAlt, MdEdit, MdEventBusy,
    MdLocationOff, MdWarning,
} from "react-icons/md";
import { localDateStr } from "@/utils/dates";
import { MAX_VISIT_TITLE_LENGTH, SESSION_STATUS } from "@/lib/constants";

const STATUS_CONFIG = {
    pending_schedule: { icon: MdSchedule, color: "text-slate-400", bg: "bg-slate-100 ", label: "Pending Schedule" },
    scheduled: { icon: MdCalendarToday, color: "text-blue-500", bg: "bg-blue-50 ", label: "Scheduled" },
    completed_by_therapist: { icon: MdTimer, color: "text-amber-500", bg: "bg-amber-50 ", label: "Awaiting Confirmation" },
    in_revision: { icon: MdEdit, color: "text-amber-600", bg: "bg-amber-50 ", label: "In Revision" },
    confirmed_by_customer: { icon: MdCheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 ", label: "Confirmed" },
    cancelled: { icon: MdCancel, color: "text-red-500", bg: "bg-red-50 ", label: "Cancelled" },
    missed: { icon: MdEventBusy, color: "text-red-500", bg: "bg-red-50 ", label: "Missed" },
    attempted: { icon: MdLocationOff, color: "text-amber-600", bg: "bg-amber-50 ", label: "Attempted Visit" },
    cancellation_requested: { icon: MdWarning, color: "text-yellow-600", bg: "bg-yellow-50 ", label: "Cancellation Pending" },
};

const formatCurrency = (amount) => `$${parseFloat(amount).toFixed(2)}`;

const getRefundPill = (session) => {
    const refunds = session.customerRefunds || [];
    if (refunds.length === 0) return null;
    const total = refunds.reduce((sum, r) => sum + parseFloat(r.amount ?? 0), 0);
    const hasPending = refunds.some((r) => r.status === "pending_connect");
    const hasTransferred = refunds.some((r) => r.status === "transferred");
    const hasCard = refunds.some((r) => r.status === "refunded_to_card");
    if (hasPending) {
        return { label: `${formatCurrency(total)} pending credit`, color: "bg-amber-50  text-amber-600 " };
    }
    if (hasTransferred) {
        return { label: `${formatCurrency(total)} credited to your account`, color: "bg-emerald-50  text-emerald-600 " };
    }
    if (hasCard) {
        return { label: `${formatCurrency(total)} credited to your account`, color: "bg-emerald-50  text-emerald-600 " };
    }
    return null;
};

const INPUT_CLASS = "w-full bg-muted-light  border border-border-light  rounded-lg px-3 py-2 text-sm text-text-main  focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none";

const LOCKED_VISIT_TITLE_STATUSES = ["confirmed_by_customer", "missed", "attempted", "cancelled"];

const formatDate = (dateStr) => {
    if (!dateStr) return "Not scheduled";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

export default function SessionList({
    sessions = [],
    booking,
    role,
    onMarkComplete,
    onConfirm,
    onSchedule,
    onRequestRevision,
    onExtendRevision,
    onResubmitSession,
    onMarkMissed,
    onReportMissed,
    onMarkAttempted,
    onCancelSession,
    onApproveSessionCancellation,
    onRejectSessionCancellation,
    onUpdateTitle,
    onRespondRevision,
}) {
    const [scheduleSessionId, setScheduleSessionId] = useState(null);
    const [scheduleDate, setScheduleDate] = useState("");
    const [loadingSessionId, setLoadingSessionId] = useState(null);
    const [loadingAction, setLoadingAction] = useState(null);
    const [showResubmitConfirm, setShowResubmitConfirm] = useState(false);
    const [resubmitSessionId, setResubmitSessionId] = useState(null);
    const [editTitleSessionId, setEditTitleSessionId] = useState(null);
    const [titleInput, setTitleInput] = useState("");

    if (!sessions || sessions.length <= 1) return null;

    const totalSessions = sessions.length;
    const confirmedCount = sessions.filter(s =>
        s.status === "confirmed_by_customer" || s.status === "attempted"
    ).length;
    // Missed/cancelled never deliver value — exclude from deliverable count.
    // Attempted DOES deliver value (partial), so it stays in the deliverable pool.
    const missedOrCancelledCount = sessions.filter(s => s.status === "missed" || s.status === "cancelled").length;
    const deliverableCount = Math.max(0, totalSessions - missedOrCancelledCount);
    const progressDenominator = deliverableCount > 0 ? deliverableCount : totalSessions;
    const progressPercent = progressDenominator > 0 ? Math.round((confirmedCount / progressDenominator) * 100) : 0;

    // Distinguish "field missing from API response" (undefined) from "genuinely not
    // configured" (null). Both hide the button, but only undefined is unexpected.
    const attemptedRateRaw = booking?.attemptedVisitRate;
    const attemptedRateFieldPresent = attemptedRateRaw !== undefined;
    const bookingAttemptedRate = attemptedRateRaw != null ? parseFloat(attemptedRateRaw) : null;
    const attemptedFeatureEnabled = attemptedRateFieldPresent && bookingAttemptedRate != null && bookingAttemptedRate > 0;

    const todayStr = localDateStr();

    const handleScheduleSubmit = async (sessionId) => {
        if (!scheduleDate) return;
        setLoadingSessionId(sessionId);
        setLoadingAction("schedule");
        try {
            await onSchedule?.(sessionId, new Date(scheduleDate).toISOString());
        } finally {
            setLoadingSessionId(null);
            setLoadingAction(null);
            setScheduleSessionId(null);
            setScheduleDate("");
        }
    };

    const handleComplete = async (sessionId) => {
        setLoadingSessionId(sessionId);
        setLoadingAction("complete");
        try {
            await onMarkComplete?.(sessionId);
        } finally {
            setLoadingSessionId(null);
            setLoadingAction(null);
        }
    };

    const handleConfirm = async (sessionId) => {
        setLoadingSessionId(sessionId);
        setLoadingAction("confirm");
        try {
            await onConfirm?.(sessionId);
        } finally {
            setLoadingSessionId(null);
            setLoadingAction(null);
        }
    };

    const handleTitleSubmit = async (sessionId) => {
        setLoadingSessionId(sessionId);
        setLoadingAction("title");
        try {
            await onUpdateTitle?.(sessionId, titleInput.trim());
        } finally {
            setLoadingSessionId(null);
            setLoadingAction(null);
            setEditTitleSessionId(null);
            setTitleInput("");
        }
    };

    const openTitleEditFor = (session) => {
        setEditTitleSessionId(session.id);
        setTitleInput(session.visitTitle || "");
    };

    const openScheduleFor = (session) => {
        setScheduleSessionId(session.id);
        // Pre-fill with existing date if rescheduling
        if (session.scheduledDate) {
            const d = new Date(session.scheduledDate);
            const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setScheduleDate(local);
        } else {
            setScheduleDate("");
        }
    };

    return (
        <>
        <div className="bg-card-light  border border-border-light  rounded-xl p-5">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-main  flex items-center gap-2">
                    <MdTaskAlt className="text-primary text-lg" />
                    Treatment Plan
                </h3>
                <span className="text-sm font-semibold text-text-muted ">
                    {confirmedCount} of {progressDenominator} completed
                    {missedOrCancelledCount > 0 && (
                        <span className="text-xs text-text-muted/70  ml-1">
                            ({missedOrCancelledCount} {sessions.some(s => s.status === "missed") ? "missed" : "cancelled"})
                        </span>
                    )}
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100  rounded-full mb-5">
                <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Session rows */}
            <div className="space-y-3">
                {sessions.map((session) => {
                    const config = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending_schedule;
                    const StatusIcon = config.icon;
                    const isSchedulable = role === "therapist" && (session.status === "pending_schedule" || session.status === "scheduled");
                    const canEditTitle = role === "therapist" && !LOCKED_VISIT_TITLE_STATUSES.includes(session.status) && onUpdateTitle;
                    const isCompletable = role === "therapist" && session.status === "scheduled";
                    const isConfirmable = role === "customer" && session.status === SESSION_STATUS.COMPLETED_BY_THERAPIST;
                    const canRequestRevision = role === "customer" && session.status === SESSION_STATUS.COMPLETED_BY_THERAPIST && onRequestRevision;
                    const canExtendRevision = role === "therapist" && session.status === SESSION_STATUS.IN_REVISION && onExtendRevision;
                    const canResubmitSession = role === "therapist" && session.status === SESSION_STATUS.IN_REVISION && session.revisionDueBy && onResubmitSession;
                    const canRespondRevision = role === "therapist" && session.status === SESSION_STATUS.IN_REVISION && !session.revisionDueBy && onRespondRevision;
                    const isInRevision = session.status === SESSION_STATUS.IN_REVISION;
                    const wasRevised = session.revisionCount > 0;
                    const isResubmitted = wasRevised && session.status === SESSION_STATUS.COMPLETED_BY_THERAPIST;
                    const isThisLoading = loadingSessionId === session.id;
                    const isAnyLoading = loadingSessionId !== null;

                    // Missed-visit logic
                    const isMissed = session.status === "missed";
                    const isAttempted = session.status === "attempted";
                    const scheduledInPast = session.scheduledDate && new Date(session.scheduledDate) <= new Date();
                    const canCancelSession = ["scheduled", "pending_schedule"].includes(session.status) && onCancelSession;
                    const isCancellationPending = session.status === "cancellation_requested";
                    const canApproveCancellation = isCancellationPending && session.cancellationRequestedBy !== role && onApproveSessionCancellation;
                    const canRejectCancellation = isCancellationPending && session.cancellationRequestedBy !== role && onRejectSessionCancellation;
                    const canMarkMissed = role === "therapist" && session.status === "scheduled" && onMarkMissed;
                    const canReportMissed = role === "customer" && session.status === "scheduled" && scheduledInPast && onReportMissed;
                    // Attempted visit: therapist-only; needs the snapshot rate set; same
                    // timing block as missed (must be on or after the scheduled date).
                    const canMarkAttempted = role === "therapist"
                        && session.status === "scheduled"
                        && scheduledInPast
                        && attemptedFeatureEnabled
                        && onMarkAttempted;
                    const refundPill = getRefundPill(session);
                    const showActionsRow = (isCompletable && scheduleSessionId !== session.id)
                        || isConfirmable
                        || (isInRevision && role === "customer")
                        || canRespondRevision
                        || canExtendRevision
                        || canResubmitSession
                        || (canMarkMissed && scheduleSessionId !== session.id)
                        || (canCancelSession && scheduleSessionId !== session.id)
                        || isCancellationPending
                        || (canMarkAttempted && scheduleSessionId !== session.id)
                        || (!canMarkAttempted && !attemptedRateFieldPresent && role === "therapist" && session.status === "scheduled" && scheduledInPast)
                        || canReportMissed;

                    return (
                        <div key={session.id}>
                            <div
                                className={`p-4 rounded-xl border space-y-3 ${session.status === "confirmed_by_customer"
                                    ? "border-emerald-200  bg-emerald-50/50 "
                                    : "border-border-light "
                                    }`}
                            >
                                <div className="flex flex-wrap items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                                        <StatusIcon className={`text-xl ${config.color}`} />
                                    </div>

                                    <div className="flex-1 min-w-0" style={{ minWidth: "140px" }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-text-main ">
                                                {session.visitTitle ? `Visit ${session.sessionNumber}: ${session.visitTitle}` : `Visit ${session.sessionNumber}`}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                                                {isResubmitted ? "Resubmitted" : config.label}
                                            </span>
                                            {canEditTitle && editTitleSessionId !== session.id && (
                                                <button
                                                    onClick={() => openTitleEditFor(session)}
                                                    disabled={isAnyLoading}
                                                    aria-label="Edit visit title"
                                                    title="Edit visit title"
                                                    className="p-1 rounded-full text-text-muted hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                                >
                                                    <MdEdit className="text-sm" />
                                                </button>
                                            )}
                                        </div>
                                        {editTitleSessionId === session.id && (
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={titleInput}
                                                    onChange={(e) => setTitleInput(e.target.value)}
                                                    maxLength={MAX_VISIT_TITLE_LENGTH}
                                                    placeholder="e.g. Initial Evaluation"
                                                    aria-label="Visit title"
                                                    className={`${INPUT_CLASS} flex-1 min-w-[220px]`}
                                                />
                                                <button
                                                    onClick={() => handleTitleSubmit(session.id)}
                                                    disabled={isThisLoading && loadingAction === "title"}
                                                    className="text-xs font-bold text-white bg-primary px-3 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                                                >
                                                    {isThisLoading && loadingAction === "title" ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    onClick={() => { setEditTitleSessionId(null); setTitleInput(""); }}
                                                    className="text-xs text-text-muted hover:text-red-500 px-2 py-2"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <p className="text-xs text-text-muted ">
                                                {session.scheduledDate ? formatDate(session.scheduledDate) : "Date not set"}
                                            </p>
                                            {isSchedulable && scheduleSessionId !== session.id && (
                                                <button
                                                    onClick={() => openScheduleFor(session)}
                                                    disabled={isAnyLoading}
                                                    aria-label={session.status === "scheduled" ? "Change date" : "Set date"}
                                                    title={session.status === "scheduled" ? "Change date" : "Set date"}
                                                    className="p-1 rounded-full text-text-muted hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                                                >
                                                    <MdCalendarToday className="text-sm" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {isResubmitted && role === "customer" && (
                                        <div className="mt-1 text-[10px] space-y-0.5">
                                            <p className="text-amber-600  font-medium">
                                                Therapist resubmitted this session after your revision request. Please review and confirm.
                                            </p>
                                            {session.revisionLastSubmittedAt && (
                                                <p className="text-text-muted ">
                                                    Resubmitted on {formatDate(session.revisionLastSubmittedAt)}
                                                </p>
                                            )}
                                            {session.revisionDueBy && (
                                                <p className="text-text-muted ">
                                                    Therapist committed to: {formatDate(session.revisionDueBy)}
                                                </p>
                                            )}
                                            {session.revisionReason && (
                                                <p className="text-text-muted  italic">
                                                    Your request: &quot;{session.revisionReason.length > 80 ? session.revisionReason.slice(0, 80) + "..." : session.revisionReason}&quot;
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {isResubmitted && role === "therapist" && (
                                        <p className="text-[10px] text-amber-600  mt-0.5 font-medium">
                                            Resubmitted · Awaiting customer confirmation
                                        </p>
                                    )}
                                    {isInRevision && role === "customer" && (
                                        <div className="mt-1 text-[10px] space-y-0.5">
                                            {session.revisionReason && (
                                                <p className="text-amber-600  italic">
                                                    Your revision: &quot;{session.revisionReason.length > 60 ? session.revisionReason.slice(0, 60) + "..." : session.revisionReason}&quot;
                                                </p>
                                            )}
                                            {session.revisionDueBy && (
                                                <p className="text-text-muted ">
                                                    Therapist will resubmit by {formatDate(session.revisionDueBy)}
                                                </p>
                                            )}
                                            {!session.revisionDueBy && (
                                                <p className="text-text-muted ">
                                                    Waiting for therapist to respond
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {isInRevision && role === "therapist" && (
                                        <div className="mt-1 text-[10px] space-y-0.5">
                                            {session.revisionReason && (
                                                <p className="text-amber-600  italic">
                                                    Requested: &quot;{session.revisionReason.length > 60 ? session.revisionReason.slice(0, 60) + "..." : session.revisionReason}&quot;
                                                </p>
                                            )}
                                            {session.revisionDueBy && (
                                                <p className="text-text-muted ">
                                                    You committed to resubmit by {formatDate(session.revisionDueBy)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Missed visit details (both roles see this) */}
                                    {isMissed && (
                                        <div className="mt-1 text-[10px] space-y-0.5">
                                            <p className="text-red-600  font-medium">
                                                {session.missedBy === "therapist"
                                                    ? (role === "therapist" ? "You marked this session as missed." : "Missed by therapist.")
                                                    : (role === "customer" ? "You reported this as a missed visit." : "Reported as missed by customer.")}
                                            </p>
                                            {session.missedReason && (
                                                <p className="text-text-muted  italic">
                                                    Reason: &quot;{session.missedReason.length > 80 ? session.missedReason.slice(0, 80) + "..." : session.missedReason}&quot;
                                                </p>
                                            )}
                                            {session.missedAt && (
                                                <p className="text-text-muted ">
                                                    Marked on {formatDate(session.missedAt)}
                                                </p>
                                            )}
                                            {refundPill && (
                                                <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${refundPill.color}`}>
                                                    {refundPill.label}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Attempted visit details (both roles) */}
                                    {isAttempted && (
                                        <div className="mt-1 text-[10px] space-y-0.5">
                                            <p className="text-amber-700  font-medium">
                                                {role === "therapist"
                                                    ? "You recorded an attempted visit."
                                                    : "Therapist recorded an attempted visit."}
                                            </p>
                                            {session.attemptedRateCharged != null && (
                                                <p className="text-text-muted ">
                                                    {role === "therapist"
                                                        ? `Released to you: ${formatCurrency(session.attemptedRateCharged)} (before commission)`
                                                        : `Charged: ${formatCurrency(session.attemptedRateCharged)} of session rate`}
                                                </p>
                                            )}
                                            {session.attemptedReason && (
                                                <p className="text-text-muted  italic">
                                                    Reason: &quot;{session.attemptedReason.length > 80 ? session.attemptedReason.slice(0, 80) + "..." : session.attemptedReason}&quot;
                                                </p>
                                            )}
                                            {session.attemptedAt && (
                                                <p className="text-text-muted ">
                                                    Recorded on {formatDate(session.attemptedAt)}
                                                </p>
                                            )}
                                            {refundPill && (
                                                <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${refundPill.color}`}>
                                                    {refundPill.label}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {showActionsRow && (
                                <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-border-light">
                                    {isCompletable && scheduleSessionId !== session.id && (
                                        <button
                                            onClick={() => handleComplete(session.id)}
                                            disabled={isAnyLoading}
                                            className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {isThisLoading && loadingAction === "complete" ? "Completing..." : "Complete"}
                                        </button>
                                    )}

                                    {isConfirmable && (
                                        <>
                                            <button
                                                onClick={() => handleConfirm(session.id)}
                                                disabled={isAnyLoading}
                                                className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {isThisLoading && loadingAction === "confirm" ? "Confirming..." : "Confirm"}
                                            </button>
                                            {canRequestRevision && (
                                                <button
                                                    onClick={() => onRequestRevision(session.id)}
                                                    disabled={isAnyLoading}
                                                    className="text-xs font-bold text-amber-600  hover:underline disabled:opacity-50"
                                                >
                                                    Revision
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {isInRevision && role === "customer" && (
                                        <span className="text-[10px] font-bold text-amber-600  italic">
                                            {session.revisionDueBy ? "Therapist working on it" : "Awaiting therapist"}
                                        </span>
                                    )}
                                    {canRespondRevision && (
                                        <button
                                            onClick={() => onRespondRevision(session.id)}
                                            disabled={isAnyLoading}
                                            className="text-xs font-bold text-amber-700 border border-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-50 disabled:opacity-50 transition-colors"
                                        >
                                            Respond
                                        </button>
                                    )}
                                    {canExtendRevision && (
                                        <button
                                            onClick={() => onExtendRevision(session.id)}
                                            disabled={isAnyLoading}
                                            className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5  disabled:opacity-50 transition-colors"
                                        >
                                            {isThisLoading && loadingAction === "extend" ? "Extending..." : "Extend"}
                                        </button>
                                    )}
                                    {canResubmitSession && (
                                        <button
                                            onClick={() => { setResubmitSessionId(session.id); setShowResubmitConfirm(true); }}
                                            disabled={isAnyLoading}
                                            className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                        >
                                            Resubmit
                                        </button>
                                    )}
                                    {canMarkMissed && scheduleSessionId !== session.id && (
                                        <button
                                            onClick={() => onMarkMissed(session)}
                                            disabled={isAnyLoading}
                                            className="text-xs font-bold text-red-500  hover:underline disabled:opacity-50"
                                        >
                                            Mark Missed
                                        </button>
                                    )}
                                    {canCancelSession && scheduleSessionId !== session.id && (
                                        <button
                                            onClick={() => onCancelSession(session)}
                                            disabled={isAnyLoading}
                                            className="text-xs font-bold text-red-500  border border-red-200  px-3 py-1.5 rounded-lg hover:bg-red-50  disabled:opacity-50"
                                        >
                                            Cancel Session
                                        </button>
                                    )}
                                    {isCancellationPending && (
                                        <div className="w-full mt-1 p-2 bg-yellow-50  border border-yellow-200  rounded-lg space-y-1">
                                            <p className="text-xs text-yellow-800 font-semibold">
                                                Cancellation requested by {session.cancellationRequestedBy}
                                            </p>
                                            {session.cancellationReason && (
                                                <p className="text-xs text-yellow-700">&ldquo;{session.cancellationReason}&rdquo;</p>
                                            )}
                                            {(canApproveCancellation || canRejectCancellation) && (
                                                <div className="flex gap-2 pt-1">
                                                    {canApproveCancellation && (
                                                        <button
                                                            onClick={() => onApproveSessionCancellation(session)}
                                                            disabled={isAnyLoading}
                                                            className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {canRejectCancellation && (
                                                        <button
                                                            onClick={() => onRejectSessionCancellation(session)}
                                                            disabled={isAnyLoading}
                                                            className="text-xs font-bold text-yellow-800 border border-yellow-400 hover:bg-yellow-100 px-3 py-1 rounded-lg disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {canMarkAttempted && scheduleSessionId !== session.id && (
                                        <button
                                            onClick={() => onMarkAttempted(session)}
                                            disabled={isAnyLoading}
                                            className="text-xs font-bold text-amber-600  border border-amber-300  px-3 py-1.5 rounded-lg hover:bg-amber-50  disabled:opacity-50"
                                            title={`Patient not home — record attempted visit (${formatCurrency(bookingAttemptedRate)} fee)`}
                                        >
                                            Mark Attempted
                                        </button>
                                    )}
                                    {!canMarkAttempted && !attemptedRateFieldPresent && role === "therapist" && session.status === "scheduled" && scheduledInPast && (
                                        <span className="text-xs text-text-muted ">
                                            Attempted visit unavailable — contact support.
                                        </span>
                                    )}
                                    {canReportMissed && (
                                        <button
                                            onClick={() => onReportMissed(session)}
                                            disabled={isAnyLoading}
                                            className="text-xs font-bold text-red-500  border border-red-300  px-3 py-1.5 rounded-lg hover:bg-red-50  disabled:opacity-50"
                                        >
                                            Report Missed
                                        </button>
                                    )}
                                </div>
                                )}
                            </div>

                            {/* Schedule date picker (inline below the session row) */}
                            {scheduleSessionId === session.id && (
                                <div className="mt-2 p-4 rounded-xl border border-border-light bg-muted-light space-y-3">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                                        {session.status === "scheduled" ? "Reschedule to:" : "Schedule for:"}
                                    </label>
                                    <div className="flex flex-col md:flex-row items-center gap-3">
                                        <div className="relative w-full flex-1">
                                            <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                            <input
                                                type="date"
                                                min={todayStr}
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                className={`${INPUT_CLASS} pl-9`}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleScheduleSubmit(session.id)}
                                                disabled={!scheduleDate || (isThisLoading && loadingAction === "schedule")}
                                                className="text-xs font-bold text-white bg-primary px-4 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {isThisLoading && loadingAction === "schedule" ? "Setting..." : "Set Date"}
                                            </button>
                                            <button
                                                onClick={() => { setScheduleSessionId(null); setScheduleDate(""); }}
                                                className="text-xs text-text-muted hover:text-red-500 px-2 py-2.5"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        <ConfirmModal
            isOpen={showResubmitConfirm}
            onClose={() => { if (!loadingSessionId) { setShowResubmitConfirm(false); setResubmitSessionId(null); } }}
            onConfirm={async () => {
                if (!resubmitSessionId) return;
                setLoadingSessionId(resubmitSessionId);
                setLoadingAction("resubmit");
                try {
                    await onResubmitSession(resubmitSessionId);
                    setShowResubmitConfirm(false);
                    setResubmitSessionId(null);
                } finally {
                    setLoadingSessionId(null);
                    setLoadingAction(null);
                }
            }}
            title="Resubmit Session"
            message="This will notify the customer that the session is ready for review. They will have 72 hours to confirm or request another revision."
            confirmLabel="Resubmit"
            confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white"
            loading={loadingAction === "resubmit" && !!loadingSessionId}
        />
        </>
    );
}
