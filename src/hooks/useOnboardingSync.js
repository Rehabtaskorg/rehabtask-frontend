"use client";

import { useCallback } from "react";
import { onboardingAPI } from "@/lib/onboarding.api";
import useOnboardingStore from "@/store/onboardingStore";
import { logger } from "@/lib/logger";

/**
 * Hook to sync onboarding status from backend to Zustand store.
 * Call this in layouts or pages that need real-time onboarding status.
 */
export function useOnboardingSync() {
    const { setCurrentStep, markStepComplete } = useOnboardingStore();

    const syncStatus = useCallback(async () => {
        try {
            const response = await onboardingAPI.getOnboardingStatus();
            const { data } = response.data;

            setCurrentStep(data.therapist.onboardingStep);

            const { steps } = data;
            if (steps.personalInfo) markStepComplete(1);
            if (steps.profile) markStepComplete(2);
            if (steps.credentials) markStepComplete(3);
            if (steps.availability) markStepComplete(4);
            if (steps.insurance) markStepComplete(5);
            if (steps.identity) markStepComplete(6);
            if (steps.stripe) markStepComplete(8);

            return {
                progress: data.progress,
                onboardingComplete: data.therapist.onboardingComplete,
                approvalStatus: data.therapist.approvalStatus,
                steps: data.steps,
            };
        } catch (error) {
            logger.error("Failed to sync onboarding status:", error);
            return null;
        }
    }, [setCurrentStep, markStepComplete]);

    return { syncStatus };
}