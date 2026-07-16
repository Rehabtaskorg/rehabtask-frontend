import { api } from "./api";

export const individualOnboardingAPI = {
    /**
     * Get individual onboarding status and step progress.
     * @returns {Promise}
     */
    getIndividualOnboardingStatus: async () => {
        return api.get("/individual/onboarding/status");
    },

    /**
     * Get all previously saved onboarding field values for form repopulation.
     * @returns {Promise}
     */
    getIndividualOnboardingData: async () => {
        return api.get("/individual/onboarding/data");
    },

    /**
     * Save Personal Information (Step 2).
     * @param {{ dateOfBirth: string, addressLine1: string, addressLine2?: string, city: string, state: string, zipCode: string }} data
     * @returns {Promise}
     */
    savePersonalInfo: async (data) => {
        return api.post("/individual/onboarding/personal-info", data);
    },

    /**
     * Save Medical Information (Step 3).
     * @param {{ primaryDiagnosis: string, referringProviderName?: string }} data
     * @returns {Promise}
     */
    saveMedicalInfo: async (data) => {
        return api.post("/individual/onboarding/medical-info", data);
    },

    /**
     * Upload a single individual onboarding document (optional therapy order).
     * Upload-on-drop: called immediately when a file is dropped, not on submit.
     * @param {File} file
     * @param {string} documentType - One of: therapy_order
     * @returns {Promise<{ id, path, fileName, fileSize, mimeType, documentType, status, uploadedAt }>}
     */
    uploadDocument: async (file, documentType) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);

        const response = await api.post("/individual/onboarding/upload-document", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data.data;
    },

    /**
     * Soft-delete an individual onboarding document by ID.
     * @param {string} documentId
     * @returns {Promise}
     */
    deleteDocument: async (documentId) => {
        return api.delete(`/individual/onboarding/document/${documentId}`);
    },

    /**
     * Complete individual onboarding (Step 4 — Activation).
     * Sets approvalStatus = "approved" + onboardingComplete = true instantly.
     * @returns {Promise<{ customer: { id, onboardingComplete, approvalStatus } }>}
     */
    completeIndividualOnboarding: async () => {
        return api.post("/individual/onboarding/complete");
    },
};