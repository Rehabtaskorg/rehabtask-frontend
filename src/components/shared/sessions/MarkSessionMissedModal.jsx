"use client";

import { useState } from "react";
import { MdClose, MdWarning, MdInfo } from "react-icons/md";
import { bookingsApi } from "@/services/booking.api";
import { showToast } from "@/lib/toast";

/**
 * Shared modal for marking a session as missed. Used by both therapist
 * (self-report) and customer (no-show complaint) flows.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} props.sessionId
 * @param {number} props.sessionNumber
 * @param {"therapist"|"customer"} props.actorRole
 * @param {number} props.refundAmount - what will be refunded to the customer
 * @param {() => void} [props.onSuccess]
 */
export default function MarkSessionMissedModal({
    isOpen,
    onClose,
    sessionId,
    sessionNumber,
    actorRole,
    refundAmount,
    onSuccess,
}) {
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const isTherapist = actorRole === "therapist";
    const trimmedReason = reason.trim();
    const isValid = trimmedReason.length >= 10;

    const copy = isTherapist
        ? {
            title: "Mark Session as Missed",
            subtitle: "Let the customer know you couldn't attend this session.",
            placeholder: "e.g. I had a medical emergency and couldn't make it to the scheduled session.",
            infoText: "The customer will be credited for this session. If they've set up a payout account, the credit goes directly to their bank. Otherwise, they'll be prompted to set it up.",
            submitButton: "Mark as Missed",
            successMessage: "Session marked as missed. Customer has been notified and will be credited.",
        }
        : {
            title: "Report Missed Visit",
            subtitle: "Let us know the therapist did not attend this session.",
            placeholder: "e.g. The therapist did not show up for the scheduled appointment and did not contact me.",
            infoText: "Once reported, you'll be credited for this session. The therapist will be notified. If they dispute this, our support team will review.",
            submitButton: "Report Missed Visit",
            successMessage: "Missed visit reported. Your account credit is being processed.",
        };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            if (isTherapist) {
                await bookingsApi.markSessionMissedByTherapist(sessionId, trimmedReason);
            } else {
                await bookingsApi.markSessionMissedByCustomer(sessionId, trimmedReason);
            }
            showToast.success(copy.successMessage);
            setReason("");
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to mark session as missed. Please try again.");
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
            <div className="bg-card-light  rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-light  flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <MdWarning className="text-amber-500 text-xl" />
                        <h2 className="text-lg font-semibold text-text-main ">
                            {copy.title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-text-muted  hover:text-text-main  transition-colors p-1 disabled:opacity-50"
                        aria-label="Close"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <div>
                        <p className="text-sm text-text-muted ">
                            {copy.subtitle}
                        </p>
                        {sessionNumber && (
                            <p className="text-xs text-text-muted  mt-1">
                                Session {sessionNumber}
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50  border border-red-200  text-red-700  px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="missed-reason"
                            className="block text-sm font-semibold text-text-main  mb-1.5"
                        >
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="missed-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={submitting}
                            rows={4}
                            maxLength={500}
                            placeholder={copy.placeholder}
                            className="w-full px-4 py-2.5 rounded-lg border border-border-light  bg-background-light  text-text-main  text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                        />
                        <p className="text-xs text-text-muted  mt-1.5">
                            {trimmedReason.length < 10
                                ? `At least 10 characters (${trimmedReason.length}/10)`
                                : `${trimmedReason.length}/500 characters`}
                        </p>
                    </div>

                    {/* Refund info */}
                    <div className="flex gap-3 p-4 bg-primary/5  border border-primary/20  rounded-lg">
                        <MdInfo className="text-primary text-lg shrink-0 mt-0.5" />
                        <div className="text-xs text-text-main  leading-relaxed space-y-1">
                            {refundAmount != null && (
                                <p>
                                    <span className="font-bold">${parseFloat(refundAmount).toFixed(2)}</span> will be credited to the customer for this session.
                                </p>
                            )}
                            <p className="text-text-muted ">
                                {copy.infoText}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-5 py-2.5 text-sm font-semibold text-text-muted  hover:text-text-main  border border-border-light  rounded-lg transition-colors disabled:opacity-50 order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!isValid || submitting}
                            className="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                        >
                            {submitting ? "Submitting..." : copy.submitButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
