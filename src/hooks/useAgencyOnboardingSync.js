"use client";

import { useCallback } from "react";
import { agencyOnboardingAPI } from "@/services/onboarding.agency.api";
import useAgencyOnboardingStore from "@/stores/agencyOnboardingStore";
import { logger } from "@/lib/logger";

export function useAgencyOnboardingSync() {
    const { setCurrentStep, markStepComplete } = useAgencyOnboardingStore();

    const syncStatus = useCallback(async () => {
        try {
            const response = await agencyOnboardingAPI.getAgencyOnboardingStatus();
            const { data } = response.data;

            setCurrentStep(data.customer.onboardingStep);

            const { steps } = data;
            if (steps.businessProfile) markStepComplete(2);

            return {
                progress: data.progress,
                onboardingStep: data.customer.onboardingStep,
                onboardingComplete: data.customer.onboardingComplete,
                approvalStatus: data.customer.approvalStatus,
                steps: data.steps,
            };
        } catch (error) {
            logger.error("Failed to sync agency onboarding status:", error);
            return null;
        }
    }, [setCurrentStep, markStepComplete]);

    return { syncStatus };
}

