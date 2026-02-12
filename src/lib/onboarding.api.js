import { api } from "./api";

/**
 * Therapist Onboarding API
 * All API calls related to therapist onboarding flow
 */
export const onboardingAPI = {
    saveProfessionalProfile: async (data) => {
        return api.post("/therapist/onboarding/profile", data);
    },

    saveCredentials: async (data) => {
        return api.post("/therapist/onboarding/credentials", data);
    },

    saveAvailability: async (data) => {
        return api.post("/therapist/onboarding/availability", data);
    },

    submitBackgroundCheck: async (data) => {
        return api.post("/therapist/onboarding/background-check", data);
    },

    getStripeOnboardingLink: async () => {
        return api.post("/payments/connect/create");
    },

    checkStripeStatus: async () => {
        return api.get("/payments/connect/status");
    },

    getOnboardingStatus: async () => {
        return api.get("/therapist/onboarding/status");
    },

    completeOnboarding: async () => {
        return api.post("/therapist/onboarding/complete");
    },

    /**
     * Upload file (license documents, profile photo)
     */
    uploadFile: async (file, type = "license") => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        return api.post("/therapist/onboarding/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};