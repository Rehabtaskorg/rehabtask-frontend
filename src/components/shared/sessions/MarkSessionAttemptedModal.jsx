"use client";

import { useState } from "react";
import { MdClose, MdLocationOff, MdInfo } from "react-icons/md";
import { bookingsApi } from "@/lib/bookings.api";
import { showToast } from "@/lib/toast";

/**
 * Therapist-only modal: record an attempted visit.
 *
 * Splits escrow money: therapist receives `attemptedRate`, customer is refunded
 * the remainder (`sessionRate - attemptedRate`). Both money flows are surfaced
 * in the body so the therapist confirms with explicit knowledge of the split.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} props.sessionId
 * @param {number} props.sessionNumber
 * @param {number} props.attemptedRate - booking.attemptedVisitRate (gross, pre-commission)
 * @param {number} props.sessionRate   - booking.rate
 * @param {() => void} [props.onSuccess]
 */
export default function MarkSessionAttemptedModal({
    isOpen,
    onClose,
    sessionId,
    sessionNumber,
    attemptedRate,
    sessionRate,
    onSuccess,
}) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const trimmedReason = reason.trim();
    const isValid = trimmedReason.length >= 10;

    const safeAttempted = Number(attemptedRate ?? 0);
    const safeSession = Number(sessionRate ?? 0);
    const refundAmount = Math.max(0, safeSession - safeAttempted);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            await bookingsApi.markSessionAttempted(sessionId, trimmedReason);
            showToast.success("Attempted visit recorded. Funds released and customer refunded.");
            setReason("");
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to record attempted visit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
    };

    const handleClose = () => {
        if (submitting) return;
        setReason("");
        setError(null);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-card-light dark:bg-card-dark rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MdLocationOff className="text-amber-500 text-xl" />
                        <h2 className="text-lg font-semibold text-text-main dark:text-white">
                            Mark as Attempted Visit
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors p-1 disabled:opacity-50"
                        aria-label="Close"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <p className="text-sm text-text-muted dark:text-gray-400">
                            You arrived but the patient wasn&apos;t home. This will close the session and
                            split the escrowed funds between you and the customer.
                        </p>
                        {sessionNumber && (
                            <p className="text-xs text-text-muted dark:text-gray-500 mt-1">
                                Session {sessionNumber}
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Money split — surfaced before the reason so the therapist sees the
                        consequences before they commit to the action. */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">Released to you</p>
                            <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-400">${safeAttempted.toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">before commission</p>
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400">Refunded to customer</p>
                            <p className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-400">${refundAmount.toFixed(2)}</p>
                            <p className="text-[10px] text-blue-600/80 dark:text-blue-400/70 mt-0.5">remainder of session</p>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="attempted-reason"
                            className="block text-sm font-semibold text-text-main dark:text-white mb-1.5"
                        >
                            What happened? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="attempted-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={submitting}
                            rows={4}
                            maxLength={500}
                            placeholder="e.g. Arrived at the home at 10:05 AM, knocked for 10 minutes, no answer. Called twice — went to voicemail."
                            className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                        />
                        <p className="text-xs text-text-muted dark:text-gray-500 mt-1.5">
                            {trimmedReason.length < 10
                                ? `At least 10 characters (${trimmedReason.length}/10)`
                                : `${trimmedReason.length}/500 characters`}
                        </p>
                    </div>

                    <div className="flex gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg">
                        <MdInfo className="text-primary text-lg shrink-0 mt-0.5" />
                        <div className="text-xs text-text-main dark:text-white leading-relaxed space-y-1">
                            <p>
                                The session will close in <span className="font-semibold">attempted</span> status and cannot be reopened.
                                The customer will be notified by email.
                            </p>
                            <p className="text-text-muted dark:text-gray-400">
                                Commission applies to the released amount, just like a normal session payout.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-5 py-2.5 text-sm font-semibold text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white border border-border-light dark:border-border-dark rounded-lg transition-colors disabled:opacity-50 order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid || submitting}
                            className="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                        >
                            {submitting ? "Submitting..." : "Confirm Attempted Visit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}