"use client";

import { useCallback } from "react";
import { onboardingAPI } from "@/services/onboarding.api";
import useOnboardingStore from "@/stores/onboardingStore";
import { logger } from "@/lib/logger";

/**
 * Hook to fetch every previously-saved onboarding field value from the
 * backend and repopulate the Zustand store with it. The store is the
 * source of truth for in-progress edits, but it's intentionally wiped on
 * logout — so any step form must call this on mount before it can trust
 * the store's values, otherwise a returning therapist sees blank fields
 * for steps they already completed.
 */
export function useOnboardingDataSync() {
    const {
        updatePersonalInfo,
        updateProfessionalProfile,
        updateCredentials,
        updateAvailability,
        updateInsurance,
        updateIdentity,
    } = useOnboardingStore();

    const syncData = useCallback(async () => {
        try {
            const response = await onboardingAPI.getOnboardingData();
            const { data } = response.data;

            updatePersonalInfo(data.personalInfo);
            updateProfessionalProfile(data.professionalProfile);
            updateCredentials(data.credentials);
            updateAvailability(data.availability);
            updateInsurance(data.insurance);
            updateIdentity(data.identity);

            return data;
        } catch (error) {
            logger.error("Failed to sync onboarding data:", error);
            return null;
        }
    }, [
        updatePersonalInfo,
        updateProfessionalProfile,
        updateCredentials,
        updateAvailability,
        updateInsurance,
        updateIdentity,
    ]);

    return { syncData };
}