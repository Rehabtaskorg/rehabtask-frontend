"use client";

import { formatShortDate } from "@/utils/dates";
import { CustomerClearReview } from "./CustomerClearReview";
import { CustomerRejectForm } from "./CustomerRejectForm";

/**
 * Read-only approval summary for an approved customer, plus the Clear Review
 * action and the still-available reject path.
 *
 * @param {{
 *   customerUserId: string,
 *   approvalStatus: string,
 *   pendingReviewAt?: string|null,
 *   displayName?: string,
 *   approvedAt?: string|null,
 *   actionError: string,
 *   isRejectFormOpen: boolean,
 *   rejectReason: string,
 *   rejectError: string,
 *   isRejecting: boolean,
 *   onOpenRejectForm: () => void,
 *   onReasonChange: (value: string) => void,
 *   onReject: () => void,
 *   onCancelReject: () => void,
 * }} props
 */
export function CustomerApprovedPanel({
    customerUserId,
    approvalStatus,
    pendingReviewAt,
    displayName,
    approvedAt,
    actionError,
    isRejectFormOpen,
    rejectReason,
    rejectError,
    isRejecting,
    onOpenRejectForm,
    onReasonChange,
    onReject,
    onCancelReject,
}) {
    return (
        <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-sm font-semibold text-green-800">Account approved</p>
                {approvedAt && (
                    <p className="text-xs text-green-700 mt-0.5">Approved on {formatShortDate(approvedAt)}</p>
                )}
            </div>

            <CustomerClearReview
                customerUserId={customerUserId}
                approvalStatus={approvalStatus}
                pendingReviewAt={pendingReviewAt}
                displayName={displayName}
            />

            {actionError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{actionError}</p>
            )}

            {!isRejectFormOpen ? (
                <button
                    onClick={onOpenRejectForm}
                    disabled={isRejecting}
                    className="w-full px-4 py-2 text-sm font-semibold bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                >
                    Reject
                </button>
            ) : (
                <CustomerRejectForm
                    reason={rejectReason}
                    reasonError={rejectError}
                    isPending={isRejecting}
                    onReasonChange={onReasonChange}
                    onSubmit={onReject}
                    onCancel={onCancelReject}
                />
            )}
        </div>
    );
}
