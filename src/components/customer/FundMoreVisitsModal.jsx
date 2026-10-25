"use client";

import { useRouter } from "next/navigation";
import { MdEventRepeat } from "react-icons/md";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Asks a customer whether they want more visits with the same therapist, shown once
 * their final session is confirmed.
 *
 * "Yes" sends them to the request form with the therapist pre-selected. "No" hands
 * control back to the parent, which opens the review prompt.
 *
 * @param {{ isOpen: boolean,
 *           therapist?: { id?: string, fullName?: string },
 *           onDecline: () => void,
 *           onClose: () => void }} props
 */
export function FundMoreVisitsModal({ isOpen, therapist, onDecline, onClose }) {
    const router = useRouter();
    const { trackEvent } = useAnalytics();

    const therapistName = therapist?.fullName || "your therapist";

    const handleConfirm = () => {
        if (!therapist?.id) {
            onClose();
            return;
        }
        trackEvent("direct_request_initiated", { source: "post_completion_modal" });
        router.push(`/customer/requests/new?directTo=${therapist.id}`);
    };

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onDecline}
            onConfirm={handleConfirm}
            icon={<MdEventRepeat className="text-xl text-primary" />}
            title="Book more visits?"
            message={`Would you like to continue with ${therapistName}? We'll take you to a new request with them already selected.`}
            confirmLabel="Yes, request more visits"
            cancelLabel="No, thanks"
        />
    );
}
