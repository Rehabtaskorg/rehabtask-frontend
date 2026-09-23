"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { useUpdateCustomerProfile } from "@/hooks/useCustomerProfile";
import { ConfirmableToggleRow } from "@/components/ui/ConfirmableToggleRow";

/**
 * Inline SMS notification switch. Saves immediately with optimistic local state
 * and reverts on failure.
 *
 * Turning SMS on asks for confirmation; turning it off does not. Withdrawing
 * consent should never be harder than giving it.
 *
 * @param {Object} props
 * @param {Object} props.profile - Customer profile, supplies `phone` and initial `smsOptIn`.
 */
export function CustomerSmsOptInToggle({ profile }) {
    const [smsOptIn, setSmsOptIn] = useState(profile?.smsOptIn ?? false);
    const updateProfile = useUpdateCustomerProfile();

    const hasPhone = Boolean(profile?.phone);

    const handleSmsToggle = async (next) => {
        setSmsOptIn(next);
        try {
            await updateProfile.mutateAsync({ smsOptIn: next });
        } catch (err) {
            setSmsOptIn(!next);
            logger.error("Failed to update SMS preference:", err);
        }
    };

    return (
        <ConfirmableToggleRow
            label="SMS Notifications"
            description={
                !hasPhone
                    ? "Add a phone number to enable SMS reminders"
                    : smsOptIn
                        ? "Receiving appointment reminders via SMS"
                        : "SMS reminders disabled"
            }
            isChecked={smsOptIn}
            onToggle={handleSmsToggle}
            isDisabled={!hasPhone}
            isPending={updateProfile.isPending}
            ariaLabel="Toggle SMS notifications"
            confirmOn="on"
            confirmTitle="Turn on SMS reminders?"
            confirmMessage="We'll text appointment reminders and visit updates to your phone. Message and data rates may apply. You can turn this off at any time."
            confirmLabel="Turn on SMS"
        />
    );
}
