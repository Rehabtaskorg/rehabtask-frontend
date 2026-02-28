import { api } from "./api";

export const therapistsPublicApi = {
    searchTherapists: async (params) => {
        // params: { latitude, longitude, radiusMiles, specialization, page, limit }
        // Only include non-undefined params in query string
        const cleanParams = {};
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                cleanParams[key] = value;
            }
        });
        return api.get("/therapists/search", { params: cleanParams });
    },
    getTherapistProfile: async (therapistId) => {
        return api.get(`/therapists/${therapistId}`);
    },
    getTherapistReviews: async (therapistId, page = 1, limit = 10) => {
        return api.get(`/therapists/${therapistId}/reviews`, { params: { page, limit } });
    },
};