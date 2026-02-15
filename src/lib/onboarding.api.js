import { api } from "./api";

/**
 * Therapist Onboarding API
 * All API calls related to therapist onboarding flow
 */
export const onboardingAPI = {
    /**
     * Get current onboarding status
     */
    getOnboardingStatus: async () => {
        return api.get("/therapist/onboarding/status");
    },

    /**
    * Save professional profile (Step 1)
    */
    saveProfessionalProfile: async (data) => {
        return api.post("/therapist/onboarding/profile", data);
    },

    /**
     * Save credentials (Step 2)
     */
    saveCredentials: async (data) => {
        return api.post("/therapist/onboarding/credentials", data);
    },

    /**
     * Save availability (Step 3)
     */
    saveAvailability: async (data) => {
        return api.post("/therapist/onboarding/availability", data);
    },

    /**
     * Submit background check (Step 4)
     */
    submitBackgroundCheck: async (data) => {
        return api.post("/therapist/onboarding/background-check", data);
    },

    /**
     * Complete onboarding
     */
    completeOnboarding: async () => {
        return api.post("/therapist/onboarding/complete");
    },

    /**
    * Get Stripe onboarding link
    */
    getStripeOnboardingLink: async () => {
        return api.post("/payments/connect/create");
    },

    /**
     * Check Stripe connection status
     */
    checkStripeStatus: async () => {
        return api.get("/payments/connect/status");
    },

    /**
     * Uplaod profile photo via backend
     * Uses acios with FormData - cookies handled automatically
     */
    uploadProfilePhoto: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post(
            "/therapist/onboarding/upload-profile-photo",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        );

        return response.data.data; // { url, path }
    },

    /**
     * Upload license document via backend
     * Uses axios with FormData - cookies handled automatically
     */
    uploadLicenseDocument: async (file, documentType = "license") => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);

        const response = await api.post("/therapist/onboarding/upload-document",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        );

        return response.data.data;
    },

    /**
     * Get all therapist documents
     */
    getDocuments: async () => {
        return api.get("/therapist/onboarding/documents");
    },

    /**
     * Get signed URL for viewing a document
     */
    getDocumentUrl: async (documentId) => {
        return api.get(`/therapist/onboarding/document/${documentId}`)
    },

    /**
     * Delete a document (soft delete)
     */
    deleteDocument: async (documentId) => {
        return api.delete(`/therapist/onboarding/document/${documentId}`);
    }
};