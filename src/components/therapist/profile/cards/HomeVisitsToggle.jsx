"use client";

import { useState } from "react";
import { logger } from "@/lib/logger";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";
import { ConfirmableToggleRow } from "./ConfirmableToggleRow";

const CONFIRM_COPY = {
    on: {
        title: "Offer home visits?",
        message:
            "Patients searching for in-home therapy will be able to find and book you. You can turn this off at any time.",
        label: "Offer home visits",
    },
    off: {
        title: "Stop offering home visits?",
        message:
            "You'll stop appearing in searches for in-home therapy and won't receive new home-visit requests. Visits already booked are unaffected.",
        label: "Stop home visits",
    },
};

export function HomeVisitsToggle({ profile, isOnboardingComplete }) {
    const [doesHomeVisits, setDoesHomeVisits] = useState(profile?.doesHomeVisits ?? false);
    const updateProfile = useUpdateProfile();

    const copy = doesHomeVisits ? CONFIRM_COPY.off : CONFIRM_COPY.on;

    const handleToggle = async (next) => {
        setDoesHomeVisits(next);
        try {
            await updateProfile.mutateAsync({ doesHomeVisits: next });
        } catch (err) {
            setDoesHomeVisits(!next);
            logger.error("Failed to update home visit preference:", err);
        }
    };

    return (
        <ConfirmableToggleRow
            label="Home Visits"
            description={
                doesHomeVisits
                    ? "Available for home visits"
                    : "Not offering home visits"
            }
            isChecked={doesHomeVisits}
            onToggle={handleToggle}
            isDisabled={!isOnboardingComplete}
            isPending={updateProfile.isPending}
            ariaLabel="Toggle home visits"
            confirmOn="both"
            confirmTitle={copy.title}
            confirmMessage={copy.message}
            confirmLabel={copy.label}
        />
    );
}
