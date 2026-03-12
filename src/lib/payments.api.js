import { api } from "./api";

export const paymentsApi = {
    getPaymentMethods: () => api.get("/payments/methods"),
    createSetupIntent: () => api.post("/payments/methods/setup"),
    removePaymentMethod: (id) => api.delete(`/payments/methods/${id}`),
    setDefaultPaymentMethod: (id) => api.post(`/payments/methods/${id}/default`),
};