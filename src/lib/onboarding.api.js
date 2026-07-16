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
     * Get every previously-saved onboarding field value, so step forms can
     * repopulate themselves on mount instead of relying on the Zustand
     * store (which is wiped on logout).
     */
    getOnboardingData: async () => {
        return api.get("/therapist/onboarding/data");
    },

    /**
     * Save personal information (Step 1)
     */
    savePersonalInfo: async (data) => {
        return api.post("/therapist/onboarding/personal-info", data);
    },

    /**
    * Save professional profile (Step 2)
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
     * Save insurance documentation (Step 5)
     */
    saveInsurance: async (data) => {
        return api.post("/therapist/onboarding/insurance", data);
    },

    /**
     * Save identity verification documents (Step 6)
     */
    saveIdentityVerification: async (data) => {
        return api.post("/therapist/onboarding/identity", data);
    },

    /**
     * Submit background check (Step 4)
     */
    submitBackgroundCheck: async (data) => {
        return api.post("/therapist/onboarding/background-check", data);
    },

    /**
     * Advance to Final Review (Step 8) once Stripe is finished or skipped.
     * Never blocks on Stripe — it only records that the last step was reached.
     */
    advanceToFinalReview: async () => {
        return api.post("/therapist/onboarding/advance-to-review");
    },

    /**
     * Complete onboarding
     */
    completeOnboarding: async () => {
        return api.post("/therapist/onboarding/complete");
    },

    /**
     * Create or retrieve a Stripe Custom Connect account for the therapist.
     * Returns { accountId } — no redirect URL. The embedded onboarding form
     * is rendered client-side via ConnectAccountOnboarding using a separate
     * Account Session (fetchClientSecret in StripeConnectProvider).
     */
    createStripeAccount: async () => {
        return api.post("/payments/connect/create");
    },

    /**
     * Check Stripe Connect account status.
     * Returns { connected, detailsSubmitted, chargesEnabled, payoutsEnabled, accountId? }
     * Used server-side in the onboarding stripe page's onExit handler to verify
     * completion before calling completeOnboarding — never trust onExit alone.
     */
    checkStripeStatus: async () => {
        return api.get("/payments/connect/status");
    },

    /**
     * Upload profile photo via backend
     * Uses axios with FormData — cookies handled automatically
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
     * Upload an onboarding document via backend (license, insurance, ...).
     * Uses axios with FormData - cookies handled automatically
     */
    uploadDocument: async (file, category, documentType) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);
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