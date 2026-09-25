"use client";

import { useState } from "react";
import { MdHistory } from "react-icons/md";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { APPROVAL_STATUS } from "@/lib/constants";

/**
 * "Clear Review" action for an approved account that has unreviewed profile
 * changes. Renders nothing unless the account is approved AND flagged, so it
 * can be dropped into a decision panel unconditionally.
 *
 * Presentational only — the caller supplies the mutation via `onConfirm` so
 * therapist and customer sides can each use their own hook.
 *
 * @param {{
 *   approvalStatus: string,
 *   pendingReviewAt?: string|null,
 *   accountLabel?: string,
 *   isPending: boolean,
 *   error?: string,
 *   onConfirm: () => Promise<void>|void,
 *   className?: string,
 * }} props
 */
export function ClearReviewPanel({
    approvalStatus,
    pendingReviewAt,
    accountLabel = "this account",
    isPending,
    error,
    onConfirm,
    className = "",
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isClearable =
        Boolean(pendingReviewAt) && approvalStatus === APPROVAL_STATUS.APPROVED;

    if (!isClearable) return null;

    const handleConfirm = async () => {
        setIsModalOpen(false);
        await onConfirm();
    };

    return (
        <div className={`bg-violet-50 border border-violet-200 rounded-xl p-5 space-y-3 ${className}`}>
            <div className="flex items-start gap-2">
                <MdHistory className="text-lg text-violet-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-violet-900">Profile changes awaiting review</p>
                    <p className="text-xs text-violet-700 mt-0.5">
                        This approved account has edits that have not been reviewed. Clearing the flag
                        confirms you have checked them — it does not change the approval status.
                    </p>
                </div>
            </div>

            {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
            )}

            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={isPending}
                className="w-full px-4 py-2 text-sm font-semibold bg-white border border-violet-300 text-violet-700 hover:bg-violet-100 rounded-lg transition disabled:opacity-50"
            >
                {isPending ? "Clearing…" : "Clear Review"}
            </button>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                title="Clear pending review?"
                message={`This marks the recent profile changes on ${accountLabel} as reviewed. The approval status stays unchanged and the account keeps its access.`}
                confirmLabel="Yes, clear review"
                confirmClassName="bg-violet-600 hover:bg-violet-700 text-white"
                loading={isPending}
            />
        </div>
    );
}
