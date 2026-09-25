"use client";

import { useState } from "react";
import { useApproveTherapist, useRejectTherapist } from "@/hooks/useAdmin";
import { APPROVAL_STATUS } from "@/lib/constants";

/**
 * Owns the approve / reject flow for the admin therapist review queue,
 * including the action feedback banners and the optimistic patch applied to
 * the currently selected row so the side panel reflects the new status.
 *
 * @param {{ setSelected: (updater: (prev: object|null) => object|null) => void }} params
 * @returns {{
 *   actionError: string,
 *   actionSuccess: string,
 *   isMutating: boolean,
 *   handleApprove: (therapistUserId: string) => Promise<void>,
 *   handleReject: (therapistUserId: string, reason: string) => Promise<void>,
 *   resetFeedback: () => void,
 * }}
 */
export const useTherapistQueueActions = ({ setSelected }) => {
    const [actionError, setActionError] = useState("");
    const [actionSuccess, setActionSuccess] = useState("");

    const approve = useApproveTherapist();
    const reject = useRejectTherapist();

    const resetFeedback = () => {
        setActionError("");
        setActionSuccess("");
    };

    const patchSelected = (therapistUserId, profilePatch) => {
        setSelected((prev) =>
            prev?.id === therapistUserId
                ? { ...prev, therapistProfile: { ...prev.therapistProfile, ...profilePatch } }
                : prev
        );
    };

    const handleApprove = async (therapistUserId) => {
        resetFeedback();
        try {
            await approve.mutateAsync(therapistUserId);
            setActionSuccess("Application approved successfully.");
            patchSelected(therapistUserId, { approvalStatus: APPROVAL_STATUS.APPROVED });
        } catch (e) {
            setActionError(e?.response?.data?.message || "Failed to approve application.");
        }
    };

    const handleReject = async (therapistUserId, reason) => {
        resetFeedback();
        try {
            await reject.mutateAsync({ therapistUserId, reason });
            setActionSuccess("Application rejected.");
            patchSelected(therapistUserId, {
                approvalStatus: APPROVAL_STATUS.REJECTED,
                rejectionReason: reason,
            });
        } catch (e) {
            setActionError(e?.response?.data?.message || "Failed to reject application.");
        }
    };

    return {
        actionError,
        actionSuccess,
        isMutating: approve.isPending || reject.isPending,
        handleApprove,
        handleReject,
        resetFeedback,
    };
};
