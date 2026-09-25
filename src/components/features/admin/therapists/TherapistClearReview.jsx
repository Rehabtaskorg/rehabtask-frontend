"use client";

import { useState } from "react";
import { useClearTherapistReReview } from "@/hooks/useAdmin";
import { ClearReviewPanel } from "@/components/features/admin/ClearReviewPanel";

/**
 * Wires the shared Clear Review action to the therapist mutation.
 * Renders nothing unless the therapist is approved with a pending re-review.
 *
 * @param {{ therapistUserId: string, approvalStatus: string, pendingReviewAt?: string|null, fullName?: string, className?: string }} props
 */
export function TherapistClearReview({ therapistUserId, approvalStatus, pendingReviewAt, fullName, className }) {
    const [error, setError] = useState("");
    const clearReview = useClearTherapistReReview();

    const handleConfirm = async () => {
        setError("");
        try {
            await clearReview.mutateAsync(therapistUserId);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to clear the pending review. Please try again.");
        }
    };

    return (
        <ClearReviewPanel
            approvalStatus={approvalStatus}
            pendingReviewAt={pendingReviewAt}
            accountLabel={fullName || "this therapist"}
            isPending={clearReview.isPending}
            error={error}
            onConfirm={handleConfirm}
            className={className}
        />
    );
}
