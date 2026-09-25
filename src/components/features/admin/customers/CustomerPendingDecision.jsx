"use client";

import { CustomerRejectForm } from "./CustomerRejectForm";

/**
 * Approve / reject controls for a customer still awaiting a decision.
 *
 * @param {{
 *   actionError: string,
 *   isRejectFormOpen: boolean,
 *   rejectReason: string,
 *   rejectError: string,
 *   isApproving: boolean,
 *   isRejecting: boolean,
 *   onOpenApproveConfirm: () => void,
 *   onOpenRejectForm: () => void,
 *   onReasonChange: (value: string) => void,
 *   onReject: () => void,
 *   onCancelReject: () => void,
 * }} props
 */
export function CustomerPendingDecision({
    actionError,
    isRejectFormOpen,
    rejectReason,
    rejectError,
    isApproving,
    isRejecting,
    onOpenApproveConfirm,
    onOpenRejectForm,
    onReasonChange,
    onReject,
    onCancelReject,
}) {
    return (
        <div className="bg-card-light border border-border-light rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-main">Decision</h2>

            {actionError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{actionError}</p>
            )}

            {!isRejectFormOpen ? (
                <div className="flex gap-3">
                    <button
                        onClick={onOpenApproveConfirm}
                        disabled={isApproving}
                        className="flex-1 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                        Approve
                    </button>
                    <button
                        onClick={onOpenRejectForm}
                        disabled={isRejecting}
                        className="flex-1 px-4 py-2 text-sm font-semibold bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                        Reject
                    </button>
                </div>
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
