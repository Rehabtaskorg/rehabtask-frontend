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
};
