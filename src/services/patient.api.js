import { api } from "@/lib/api";

/**
 * HTTP client for agency patient management endpoints.
 * All routes require an authenticated agency customer account.
 */
export const patientsApi = {
    /** @returns {Promise} All active patients for the authenticated agency */
    getPatients: () => api.get("/agency/patients"),

    /** @param {Object} data - Patient data (fullName, address, email, phone) */
    createPatient: (data) => api.post("/agency/patients", data),

    /** @param {string} id - Patient ID @param {Object} data - Partial patient data */
    updatePatient: (id, data) => api.put(`/agency/patients/${id}`, data),

    /** @param {string} id - Patient ID */
    getPatient: (id) => api.get(`/agency/patients/${id}`),
};