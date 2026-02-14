import { api } from "./api";
import { uploadFileToSupabase } from "./fileUpload";

/**
 * Therapist Onboarding API
 * All API calls related to therapist onboarding flow
 */
export const onboardingAPI = {
    /**
     * Get current onboarding status
     * @returns {Promise<Object>}
     */
    getOnboardingStatus: async () => {
        return api.get("/therapist/onboarding/status");
    },

    /**
    * Save professional profile (Step 1)
    * @param {Object} data - Profile data
    * @returns {Promise<Object>}
    */
    saveProfessionalProfile: async (data) => {
        return api.post("/therapist/onboarding/profile", data);
    },

    /**
     * Save credentials (Step 2)
     * @param {Object} data - Credentials data
     * @returns {Promise<Object>}
     */
    saveCredentials: async (data) => {
        return api.post("/therapist/onboarding/credentials", data);
    },

    /**
     * Save availability (Step 3)
     * @param {Object} data - Availability data
     * @returns {Promise<Object>}
     */
    saveAvailability: async (data) => {
        return api.post("/therapist/onboarding/availability", data);
    },

    /**
     * Submit background check (Step 4)
     * @param {Object} data - Background check data
     * @returns {Promise<Object>}
     */
    submitBackgroundCheck: async (data) => {
        return api.post("/therapist/onboarding/background-check", data);
    },

    /**
     * Complete onboarding
     * @returns {Promise<Object>}
     */
    completeOnboarding: async () => {
        return api.post("/therapist/onboarding/complete");
    },

    /**
    * Get Stripe onboarding link
    * @returns {Promise<Object>}
    */
    getStripeOnboardingLink: async () => {
        return api.post("/payments/connect/create");
    },

    /**
     * Check Stripe connection status
     * @returns {Promise<Object>}
     */
    checkStripeStatus: async () => {
        return api.get("/payments/connect/status");
    },

    /**
     * Upload profile photo
     * @param {File} file - The image file
     * @param {string} userId - User ID
     * @returns {Promise<{url: string}>}
     */
    uploadProfilePhoto: async (file, userId) => {
        // Upload directly to Supabase storage
        const result = await uploadFileToSupabase(file, "profile-images", userId, "profile");

        if (result.error) {
            throw new Error(result.error);
        }

        // Validate with backend
        try {
            await api.post("/therapist/onboarding/validate-upload", {
                path: result.path,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                bucket: "profile-images",
            });
        } catch (error) {
            // If validation fails, attempt to delete the uploaded file
            try {
                await uploadFileToSupabase.deleteFileFromSupabase("profile-images", result.path);
            } catch (deleteError) {
                console.error("Failed to delete invalid upload:", deleteError);
            }
            throw error;
        }

        return { url: result.url };
    },

    /**
     * Upload license document
     * @param {File} file - The document file
     * @param {string} userId - User ID
     * @return {Promise<{path: string, fileName: string, fileSize: number, mimeType: string, documentType: string}>}
     */
    uploadLicenseDocument: async (file, userId) => {
        const result = await uploadFileToSupabase(file, "license-documents", userId, "license");

        if (result.error) {
            throw new Error(result.error);
        }

        try {
            // Validate with backend
            await api.post("/therapist/onboarding/validate-upload", {
                path: result.path,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                bucket: 'license-documents',
            });
        } catch (error) {
            // if validaion fails, attempt to delete the uploaded file
            try {
                await uploadFileToSupabase.deleteFileFromSupabase("license-documents", result.path);
            } catch (deleteError) {
                console.error("Failed to delete invalid upload:", deleteError);
            }
            throw error;
        }

        return {
            path: result.path,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
            documentType: "license"
        };
    },

    /**
     * Get all therapist documents
     * @returns {Promise<Object>}
     */
    getDocuments: async () => {
        return api.get("/therapist/onboarding/documents");
    },

    /**
     * Get signed URL for viewing a document
     * @param {string} documentId - Document ID
     * @returns {Promise<Object>}
     */
    getDocumentUrl: async (documentId) => {
        return api.get(`/therapist/onboarding/document/${documentId}`)
    },

    /**
     * Delete a document (soft delete)
     * @param {string} documentId - Document ID
     * @returns {Promise<Object>}
     */
    deleteDocument: async (documentId) => {
        return api.delete(`/therapist/onboarding/document/${documentId}`);
    }
};