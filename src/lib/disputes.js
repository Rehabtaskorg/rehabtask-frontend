import { api } from "./api";

export const disputesApi = {
    create: (data) => api.post("/disputes", data),
    getMyDisputes: () => api.get("/disputes/my-disputes"),
    getById: (id) => api.get(`/disputes/${id}`),
};
