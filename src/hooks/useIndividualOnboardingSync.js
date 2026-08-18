"use client";

import { useCallback } from "react";
import { individualOnboardingAPI } from "@/services/onboarding.individual.api";
import useIndividualOnboardingStore from "@/stores/individualOnboardingStore";
import { logger } from "@/lib/logger";

/**
 * Syncs the individual onboarding store with backend status.
 * Called on mount of layout or welcome screen to restore progress.
 */
export function useIndividualOnboardingSync() {
    const { setCurrentStep, markStepComplete } = useIndividualOnboardingStore();

    const syncStatus = useCallback(async () => {
        try {
            const response = await individualOnboardingAPI.getIndividualOnboardingStatus();
            const { data } = response.data;

            setCurrentStep(data.customer.onboardingStep);

            const { steps } = data;
            if (steps.personalInfo) markStepComplete(2);
            if (steps.medicalInfo) markStepComplete(3);

            return {
                progress: data.progress,
                onboardingStep: data.customer.onboardingStep,
                onboardingComplete: data.customer.onboardingComplete,
                approvalStatus: data.customer.approvalStatus,
                steps: data.steps,
            };
        } catch (error) {
            logger.error("Failed to sync individual onboarding status:", error);
            return null;
        }
    }, [setCurrentStep, markStepComplete]);

    return { syncStatus };
}