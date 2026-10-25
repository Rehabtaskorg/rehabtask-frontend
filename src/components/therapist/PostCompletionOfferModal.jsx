"use client";

import { useState } from "react";
import { MdHandshake } from "react-icons/md";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { bookingsApi } from "@/services/booking.api";
import { showToast } from "@/lib/toast";

/**
 * Asks a therapist whether they would like to keep working with this customer,
 * once the final session of a booking is marked complete.
 *
 * "Yes" emails the customer and posts an in-app message; the customer holds the
 * next action, since a therapist cannot create an offer without an open request.
 *
 * @param {{ isOpen: boolean, sessionId: string, customerName?: string,
 *           onClose: () => void }} props
 */
export function PostCompletionOfferModal({ isOpen, sessionId, customerName, onClose }) {
    const [isSending, setIsSending] = useState(false);

    const displayName = customerName || "your customer";

    const handleConfirm = async () => {
        setIsSending(true);
        try {
            await bookingsApi.requestContinuation(sessionId);
            showToast.success(`We've emailed ${displayName} that you'd like to continue.`);
            onClose();
        } catch (err) {
            const code = err.response?.data?.code;
            if (code === "CONTINUATION_ALREADY_REQUESTED") {
                showToast.info(`${displayName} has already been notified.`);
                onClose();
                return;
            }
            showToast.error(
                err.response?.data?.message || "Could not send the message. Please try again."
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            loading={isSending}
            icon={<MdHandshake className="text-xl text-primary" />}
            title="Continue working together?"
            message={`Would you like to let ${displayName} know you're available for more visits? We'll send them a message with a link to request them.`}
            confirmLabel="Yes, let them know"
            cancelLabel="Not now"
        />
    );
}
