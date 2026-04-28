"use client";

import { useCallback } from "react";
import { onboardingAPI } from "@/lib/onboarding.api";
import useOnboardingStore from "@/store/onboardingStore";

/**
 * Hook to sync onboarding status from backend to Zustand store
 * Call this in layour or pages that need real-time onboarding status
 */
export function useOnboardingSync() {
    const { setCurrentStep, markStepComplete } = useOnboardingStore();

    const syncStatus = useCallback(async () => {
        try {
            const response = await onboardingAPI.getOnboardingStatus();
            const { data } = response.data;

            // Sync backend step to frontend
            const backendStep = data.therapist.onboardingStep;
            setCurrentStep(backendStep);

            // Sync completed steps based on backend steps object
            const { steps } = data;

            // Mark steps as complete based on backend
            if (steps.profile) markStepComplete(1);
            if (steps.credentials) markStepComplete(2);
            if (steps.availability) markStepComplete(3);
            if (steps.backgroundCheck) markStepComplete(4);
            if (steps.stripe) markStepComplete(5);

            return {
                progress: data.progress,
                onboardingComplete: data.therapist.onboardingComplete,
                approvalStatus: data.therapist.approvalStatus,
                steps: data.steps
            }
        } catch (error) {
            console.error("Failed to sync onboarding status:", error);
            return null;
        }
    }, [setCurrentStep, markStepComplete])

    return { syncStatus }
}