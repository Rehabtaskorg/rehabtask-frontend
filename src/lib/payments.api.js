import { api } from "./api";

export const paymentsApi = {
    // Saved payment methods
    getPaymentMethods: () => api.get("/payments/methods"),
    createSetupIntent: () => api.post("/payments/methods/setup"),
    removePaymentMethod: (id) => api.delete(`/payments/methods/${id}`),
    setDefaultPaymentMethod: (id) => api.post(`/payments/methods/${id}/default`),

    // Payment history
    getPaymentHistory: () => api.get("/payments/history"),

    // Customer Connect (payout account for refunds)
    createCustomerConnectAccount: () => api.post("/payments/customer-connect/create"),
    getCustomerConnectStatus: () => api.get("/payments/customer-connect/status"),
    createCustomerAccountSession: () => api.post("/payments/customer-connect/account-session"),

    // Customer refunds
    getRefundSummary: () => api.get("/payments/refunds/summary"),
    getRefundHistory: () => api.get("/payments/refunds/history"),
};