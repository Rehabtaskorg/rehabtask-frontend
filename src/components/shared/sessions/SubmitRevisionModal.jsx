"use client";

import { useState } from "react";
import { MdClose, MdInfo, MdReply } from "react-icons/md";
import { bookingsApi } from "@/lib/bookings.api";
import { showToast } from "@/lib/toast";
import { localDateTimeStr } from "@/utils/dates";

/**
 * SubmitRevisionModal - therapist-facing (Step 1 of revision response)
 *
 * The therapist acknowledges the customer's revision request and commits
 * to a date by which they'll have the updated work ready. Status stays
 * in_revision. Step 2 (resubmit) happens via the Resubmit button.
 */
export default function SubmitRevisionModal({
    isOpen,
    onClose,
    sessionId,
    revisionReason,
    onSuccess,
}) {
    const [dueBy, setDueBy] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const minDateTime = localDateTimeStr(60_000);

    const isValid = dueBy && new Date(dueBy) > new Date();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            const isoDueBy = new Date(dueBy).toISOString();
            await bookingsApi.respondToRevision(sessionId, isoDueBy);
            showToast.success("Response date set. Customer has been notified. You can now work on the revision and resubmit when ready.");
            setDueBy("");
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to set response date. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
    };

    const handleClose = () => {
        if (submitting) return;
        setDueBy("");
        setError(null);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-card-light dark:bg-card-dark rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MdReply className="text-primary text-xl" />
                        <h2 className="text-lg font-semibold text-text-main dark:text-white">
                            Respond to Revision Request
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
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-sm text-text-muted dark:text-gray-400">
                        Let the customer know when you&apos;ll have the updated session ready. You can resubmit the session once the work is done.
                    </p>

                    {/* Customer's reason - quoted block */}
                    {revisionReason && (
                        <div className="bg-muted-light dark:bg-muted-dark border-l-4 border-primary/40 rounded-r-lg p-4">
                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider mb-1.5">
                                Customer&apos;s request
                            </p>
                            <p className="text-sm text-text-main dark:text-white italic leading-relaxed">
                                &ldquo;{revisionReason}&rdquo;
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* DueBy picker */}
                    <div>
                        <label
                            htmlFor="revision-due-by"
                            className="block text-sm font-semibold text-text-main dark:text-white mb-1.5"
                        >
                            I&apos;ll have this ready by <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="revision-due-by"
                            type="datetime-local"
                            value={dueBy}
                            min={minDateTime}
                            onChange={(e) => setDueBy(e.target.value)}
                            disabled={submitting}
                            className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all scheme-light dark:scheme-dark"
                        />
                        <p className="text-xs text-text-muted dark:text-gray-500 mt-1.5">
                            The customer will see this date. You can resubmit the session once you&apos;ve completed the changes.
                        </p>
                    </div>

                    {/* Info notice */}
                    <div className="flex gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-lg">
                        <MdInfo className="text-primary text-lg shrink-0 mt-0.5" />
                        <p className="text-xs text-text-main dark:text-white leading-relaxed">
                            After setting the date, upload any updated documentation in the booking chat. When ready, click &quot;Resubmit Session&quot; to notify the customer - they&apos;ll get a fresh 72-hour window to review.
                        </p>
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
                            className="px-5 py-2.5 text-sm font-semibold bg-primary hover:brightness-95 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                        >
                            {submitting ? "Setting..." : "Set Response Date"}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}