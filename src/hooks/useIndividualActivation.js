"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { individualOnboardingAPI } from "@/services/onboarding.individual.api";
import useIndividualOnboardingStore from "@/stores/individualOnboardingStore";
import { logger } from "@/lib/logger";

/**
 * Drives the Activation step (Step 5) for individual onboarding.
 * Calls completeIndividualOnboarding, resets the onboarding store on success,
 * then hard-navigates to the customer dashboard.
 */
export function useIndividualActivation() {
    const router = useRouter();
    const reset = useIndividualOnboardingStore((s) => s.reset);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        setSubmitting(true);
        try {
            await individualOnboardingAPI.completeIndividualOnboarding();
            reset();
            window.location.href = "/customer/pending-approval";
        } catch (err) {
            logger.error("Failed to complete individual onboarding", err);
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
        onBack: () => router.push("/customer/onboarding/individual/medical-info"),
    };
}