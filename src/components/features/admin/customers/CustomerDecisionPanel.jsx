"use client";

import { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useApproveCustomer, useRejectCustomer } from "@/hooks/useAdmin";
import { APPROVAL_STATUS } from "@/lib/constants";
import { CustomerApprovedPanel } from "./CustomerApprovedPanel";
import { CustomerPendingDecision } from "./CustomerPendingDecision";
import { CustomerRejectedPanel } from "./CustomerRejectedPanel";
import { REJECT_REASON_MIN } from "./CustomerRejectForm";

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
 * Renders the decision controls for `pending` and `review` customers, the
 * approved summary (with the Clear Review action) for approved customers, and
 * a read-only reason card for rejected customers.
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

    const { approvalStatus, approvedAt, rejectionReason, pendingReviewAt } = customer;
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
        if (rejectReason.trim().length < REJECT_REASON_MIN) {
            setRejectError(`Reason must be at least ${REJECT_REASON_MIN} characters.`);
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

    function handleReasonChange(value) {
        setRejectReason(value);
        setRejectError("");
    }

    function handleOpenRejectForm() {
        setShowRejectForm(true);
        setActionError("");
    }

    function handleCancelReject() {
        setShowRejectForm(false);
        setRejectReason("");
        setRejectError("");
    }

    if (approvalStatus === APPROVAL_STATUS.APPROVED) {
        return (
            <CustomerApprovedPanel
                customerUserId={customerUserId}
                approvalStatus={approvalStatus}
                pendingReviewAt={pendingReviewAt}
                displayName={customer.agencyName || customer.fullName}
                approvedAt={approvedAt}
                actionError={actionError}
                isRejectFormOpen={showRejectForm}
                rejectReason={rejectReason}
                rejectError={rejectError}
                isRejecting={reject.isPending}
                onOpenRejectForm={handleOpenRejectForm}
                onReasonChange={handleReasonChange}
                onReject={handleReject}
                onCancelReject={handleCancelReject}
            />
        );
    }

    if (approvalStatus === APPROVAL_STATUS.REJECTED) {
        return <CustomerRejectedPanel rejectionReason={rejectionReason} />;
    }

    if (!isPendingOrReview) return null;

    return (
        <>
            <CustomerPendingDecision
                actionError={actionError}
                isRejectFormOpen={showRejectForm}
                rejectReason={rejectReason}
                rejectError={rejectError}
                isApproving={approve.isPending}
                isRejecting={reject.isPending}
                onOpenApproveConfirm={() => setShowConfirm(true)}
                onOpenRejectForm={handleOpenRejectForm}
                onReasonChange={handleReasonChange}
                onReject={handleReject}
                onCancelReject={handleCancelReject}
            />

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
