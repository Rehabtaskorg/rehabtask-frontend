"use client";

import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useApproveCustomer, useRejectCustomer } from "@/hooks/useAdmin";
import { APPROVAL_STATUS } from "@/lib/constants";
import { formatShortDate } from "@/utils/dates";

const ERROR_MAP = {
    "Cannot approve a customer who has not completed onboarding": "This customer has not completed onboarding yet.",
    "Customer is already approved": "This customer is already approved.",
    "Customer is already rejected": "This customer is already rejected.",
};

const mapError = (err) => {
    const raw = err?.response?.data?.message || "Something went wrong. Please try again.";
    return ERROR_MAP[raw] || raw;
};

/**
 * Approve / reject decision panel for the admin customer detail page.
 * Only renders when the customer is in `pending` or `review` status.
 * Shows read-only decision history for approved/rejected customers.
 *
 * @param {{ customer: object, customerUserId: string }} props
 */
export function CustomerDecisionPanel({ customer, customerUserId }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState("");
    const [actionError, setActionError] = useState("");

    const approve = useApproveCustomer();
    const reject = useRejectCustomer();

    const { approvalStatus, approvedAt, rejectionReason } = customer;
    const isPendingOrReview =
        approvalStatus === APPROVAL_STATUS.PENDING ||
        approvalStatus === APPROVAL_STATUS.REVIEW;

    async function handleApprove() {
        setActionError("");
        try {
            await approve.mutateAsync(customerUserId);
            setShowConfirm(false);
        } catch (err) {
            setActionError(mapError(err));
            setShowConfirm(false);
        }
    }

    async function handleReject() {
        setRejectError("");
        if (rejectReason.trim().length < 10) {
            setRejectError("Reason must be at least 10 characters.");
            return;
        }
        setActionError("");
        try {
            await reject.mutateAsync({ customerUserId, reason: rejectReason.trim() });
            setShowRejectForm(false);
            setRejectReason("");
        } catch (err) {
            setActionError(mapError(err));
        }
    }

    if (approvalStatus === APPROVAL_STATUS.APPROVED) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-green-800">Account approved</p>
                {approvedAt && (
                    <p className="text-xs text-green-700 mt-0.5">Approved on {formatShortDate(approvedAt)}</p>
                )}
            </div>
        );
    }

    if (approvalStatus === APPROVAL_STATUS.REJECTED) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 space-y-2">
                <p className="text-sm font-semibold text-red-800">Account rejected</p>
                {rejectionReason && (
                    <p className="text-xs text-red-700">{rejectionReason}</p>
                )}
            </div>
        );
    }

    if (!isPendingOrReview) return null;

    return (
        <>
            <div className="bg-card-light border border-border-light rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-text-main">Decision</h2>

                {actionError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{actionError}</p>
                )}

                {!showRejectForm ? (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={approve.isPending}
                            className="flex-1 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => { setShowRejectForm(true); setActionError(""); }}
                            disabled={reject.isPending}
                            className="flex-1 px-4 py-2 text-sm font-semibold bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                            Reject
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="reject-reason" className="block text-xs font-medium text-text-main mb-1">
                                Rejection reason <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="reject-reason"
                                value={rejectReason}
                                onChange={(e) => { setRejectReason(e.target.value); setRejectError(""); }}
                                maxLength={500}
                                rows={4}
                                placeholder="Explain why this account cannot be approved (min 10 characters)…"
                                className="w-full px-3 py-2 text-sm border border-border-light rounded-lg bg-background-light text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition"
                            />
                            <div className="flex justify-between mt-1">
                                {rejectError
                                    ? <p className="text-xs text-red-600">{rejectError}</p>
                                    : <span />
                                }
                                <span className="text-xs text-text-muted">{rejectReason.length}/500</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleReject}
                                disabled={reject.isPending}
                                className="flex-1 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                            >
                                {reject.isPending ? "Rejecting…" : "Confirm Rejection"}
                            </button>
                            <button
                                onClick={() => { setShowRejectForm(false); setRejectReason(""); setRejectError(""); }}
                                disabled={reject.isPending}
                                className="px-4 py-2 text-sm border border-border-light text-text-muted rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleApprove}
                title="Approve this customer?"
                message="This will grant the customer full access to the platform. You can reject them later if needed."
                confirmLabel="Yes, approve"
                confirmClassName="bg-green-600 hover:bg-green-700 text-white"
                loading={approve.isPending}
            />
        </>
    );
}