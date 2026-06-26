"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { agencyOnboardingAPI } from "@/lib/agency.onboarding.api";
import useAgencyOnboardingStore from "@/store/agencyOnboardingStore";
import { logger } from "@/lib/logger";

/**
 * Drives the Activation step (Step 5) for agency onboarding.
 * Calls completeAgencyOnboarding, resets the onboarding store on success,
 * then navigates to the customer dashboard.
 */
export function useAgencyActivation() {
    const router = useRouter();
    const reset = useAgencyOnboardingStore((state) => state.reset);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        setSubmitting(true);
        try {
            await agencyOnboardingAPI.completeAgencyOnboarding();
            reset();
            window.location.href = "/customer/dashboard";
        } catch (err) {
            logger.error("Failed to complete agency onboarding", err);
            setError(
                err.response?.data?.message || "Failed to activate your account. Please try again."
            );
            setSubmitting(false);
        }
    };

    return {
        submitting,
        error,
        onSubmit: handleSubmit,
        onBack: () => router.push("/customer/onboarding/agency/compliance"),
    };
}
