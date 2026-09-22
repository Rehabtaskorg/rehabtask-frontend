"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";
import { ConfirmableToggleRow } from "./ConfirmableToggleRow";

export function SmsOptInToggle({ profile, isOnboardingComplete }) {
    const [smsOptIn, setSmsOptIn] = useState(profile?.smsOptIn ?? false);
    const updateProfile = useUpdateProfile();

    const handleSmsToggle = async (next) => {
        setSmsOptIn(next);
        try {
            await updateProfile.mutateAsync({ phone: profile?.phone, smsOptIn: next });
        } catch (err) {
            setSmsOptIn(!next);
            logger.error("Failed to update SMS preference:", err);
        }
    };

    return (
        <ConfirmableToggleRow
            label="SMS Notifications"
            description={
                smsOptIn
                    ? "Receiving appointment reminders via SMS"
                    : "SMS reminders disabled"
            }
            isChecked={smsOptIn}
            onToggle={handleSmsToggle}
            isDisabled={!isOnboardingComplete}
            isPending={updateProfile.isPending}
            ariaLabel="Toggle SMS notifications"
            confirmOn="on"
            confirmTitle="Turn on SMS reminders?"
            confirmMessage="We'll text appointment reminders and visit updates to your phone. Message and data rates may apply. You can turn this off at any time."
            confirmLabel="Turn on SMS"
        />
    );
}
