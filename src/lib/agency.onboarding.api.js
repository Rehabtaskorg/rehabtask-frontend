import { api } from "./api";

export const agencyOnboardingAPI = {
    /**
     * Get agency onboarding status and step progress.
     * @returns {Promise}
     */
    getAgencyOnboardingStatus: async () => {
        return api.get("/agency/onboarding/status");
    },

    /**
     * Get all previously saved onboarding field values for form repopulation.
     * Also returns read-only registration fields (agencyName, fullName, phone, email).
     * @returns {Promise}
     */
    getAgencyOnboardingData: async () => {
        return api.get("/agency/onboarding/data");
    },

    /**
     * Save Agency Business Profile (Step 2).
     * @param {{ dbaName?, ein?, billingEmail, addressLine1, addressLine2?, city, state, zipCode }} data
     * @returns {Promise}
     */
    saveAgencyBusinessProfile: async (data) => {
        return api.post("/agency/onboarding/business-profile", data);
    },

    /**
     * Upload a single agency onboarding document (Step 3).
     * Upload-on-drop: called immediately when a file is dropped, not on submit.
     * @param {File} file
     * @param {string} documentType - One of: home_health_license, medicare_medicaid_cert, general_liability, professional_liability
     * @returns {Promise<{ id, path, fileName, fileSize, mimeType, documentType, status, uploadedAt }>}
     */
    uploadAgencyDocument: async (file, documentType) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", documentType);

        const response = await api.post("/agency/onboarding/upload-document", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data.data;
    },

    /**
     * Reconcile and save agency upload documents, advancing onboardingStep to 3.
     * @param {{ documents: Array<{ path, fileName, fileSize, documentType, mimeType }> }} data
     * @returns {Promise}
     */
    saveAgencyUploadDocuments: async (data) => {
        return api.post("/agency/onboarding/save-upload-documents", data);
    },

    /**
     * Soft-delete an agency onboarding document by ID.
     * @param {string} documentId
     * @returns {Promise}
     */
    deleteAgencyDocument: async (documentId) => {
        return api.delete(`/agency/onboarding/document/${documentId}`);
    },
};
