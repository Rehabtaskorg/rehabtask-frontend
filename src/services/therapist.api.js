import { api } from "@/lib/api";

export const therapistApi = {
    getProfile: () => api.get("/therapist/profile"),
    updateProfile: (data) => api.put('/therapist/profile', data),
    updateWorkAreas: (workAreas) => api.put('/therapist/work-areas', { workAreas }),
    updateAvailability: (schedule) => api.put('/therapist/availability', { schedule }),
};