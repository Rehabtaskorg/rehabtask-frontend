import { api } from "./api";

export const patientsApi = {
    getPatients: () => api.get("/agency/patients"),
    createPatient: (data) => api.post("/agency/patients", data),
    updatePatient: (id, data) => api.put(`/agency/patients/${id}`, data),
    getPatient: (id) => api.get(`/agency/patients/${id}`),
};