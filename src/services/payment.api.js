import { api } from "@/lib/api";

/**
 * API methods for payments, saved cards, customer Connect, and refunds.
 */
export const paymentsApi = {
    // Saved payment methods
    getPaymentMethods: () => api.get("/payments/methods"),
    createSetupIntent: () => api.post("/payments/methods/setup"),
    removePaymentMethod: (id) => api.delete(`/payments/methods/${id}`),
    setDefaultPaymentMethod: (id) => api.post(`/payments/methods/${id}/default`),

    // Payment history
    getPaymentHistory: () => api.get("/payments/history"),

    // Therapist Connect (payout account for earnings)
    createTherapistConnectAccount: (data) => api.post("/payments/connect/create", data),
    getTherapistConnectStatus: () => api.get("/payments/connect/status"),

    // Customer Connect (payout account for refunds)
    createCustomerConnectAccount: (data) => api.post("/payments/customer-connect/create", data),
    getCustomerConnectStatus: () => api.get("/payments/customer-connect/status"),
    createCustomerAccountSession: () => api.post("/payments/customer-connect/account-session"),

    // Customer refunds
    getRefundSummary: () => api.get("/payments/refunds/summary"),
    getRefundHistory: () => api.get("/payments/refunds/history"),
};