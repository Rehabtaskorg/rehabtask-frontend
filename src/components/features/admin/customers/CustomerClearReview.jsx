"use client";

import { useState } from "react";
import { useClearCustomerReReview } from "@/hooks/useAdmin";
import { ClearReviewPanel } from "@/components/features/admin/ClearReviewPanel";

/**
 * Wires the shared Clear Review action to the customer mutation.
 * Renders nothing unless the customer is approved with a pending re-review.
 *
 * @param {{ customerUserId: string, approvalStatus: string, pendingReviewAt?: string|null, displayName?: string }} props
 */
export function CustomerClearReview({ customerUserId, approvalStatus, pendingReviewAt, displayName }) {
    const [error, setError] = useState("");
    const clearReview = useClearCustomerReReview();

    const handleConfirm = async () => {
        setError("");
        try {
            await clearReview.mutateAsync(customerUserId);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to clear the pending review. Please try again.");
        }
    };

    return (
        <ClearReviewPanel
            approvalStatus={approvalStatus}
            pendingReviewAt={pendingReviewAt}
            accountLabel={displayName || "this customer"}
            isPending={clearReview.isPending}
            error={error}
            onConfirm={handleConfirm}
        />
    );
}
