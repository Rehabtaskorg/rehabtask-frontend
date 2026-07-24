import { api } from "./api";

export const publicApi = {
    // Therapists
    searchTherapists: (params) => api.get("/therapists/search", { params }),
    getTherapistProfile: (id) => api.get(`/therapists/${id}`),
    getTherapistReviews: (id, params) => api.get(`/therapists/${id}/reviews`, { params }),
    getPlatformStats: () => api.get("/therapists/stats"),

    // Requests
    browseRequests: (params) => api.get("/public/requests", { params }),
};
