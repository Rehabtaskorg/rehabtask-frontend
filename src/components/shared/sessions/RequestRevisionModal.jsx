"use client";

import { useState } from "react";
import { MdClose, MdEdit } from "react-icons/md";
import { bookingsApi } from "@/lib/bookings.api";
import { showToast } from "@/lib/toast";

/**
 * RequestRevisionModal — customer-facing
 *
 * Shown on the booking detail page when a customer wants to push back on a
 * session the therapist marked complete. The mandatory reason is sent to
 * the backend, which moves the session to `in_revision` and notifies the
 * therapist.
 *
 * The modal is fully self-contained: it owns the textarea state, the
 * minimum-character validation, the API call, and the loading/error UI.
 * The parent only needs to provide isOpen, sessionId, and an onSuccess
 * callback to refresh whatever it's rendering.
 */
const MIN_REASON_LENGTH = 10;

export default function RequestRevisionModal({ isOpen, onClose, sessionId, onSuccess }) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const reasonTrimmed = reason.trim();
    const isValid = reasonTrimmed.length >= MIN_REASON_LENGTH;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            await bookingsApi.requestSessionRevision(sessionId, reasonTrimmed);
            showToast.success("Revision request sent to therapist.");
            setReason("");
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send revision request. Please try again.");
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
            <div className="bg-card-light dark:bg-card-dark rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MdEdit className="text-primary text-xl" />
                        <h2 className="text-lg font-semibold text-text-main dark:text-white">
                            Request Revision
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

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <p className="text-sm text-text-muted dark:text-gray-400">
                        Tell the therapist what needs to change. They&apos;ll review your feedback and resubmit the session.
                    </p>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="revision-reason"
                            className="block text-sm font-semibold text-text-main dark:text-white mb-1.5"
                        >
                            What needs to change? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="revision-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Be specific so the therapist knows exactly what to update — e.g. 'The exercise sheet is missing the home exercises we discussed.'"
                            disabled={submitting}
                            rows={5}
                            className="w-full px-4 py-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none placeholder:text-text-muted dark:placeholder:text-gray-500"
                        />
                        <p className="text-xs text-text-muted dark:text-gray-500 mt-1.5">
                            Minimum {MIN_REASON_LENGTH} characters
                            {reasonTrimmed.length > 0 && ` — ${reasonTrimmed.length}/${MIN_REASON_LENGTH}`}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-5 py-2.5 text-sm font-semibold text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white border border-border-light dark:border-border-dark rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid || submitting}
                            className="px-5 py-2.5 text-sm font-semibold bg-primary hover:brightness-95 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Sending..." : "Send Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}