import api from "./api";

export const subscriptionApi = {
    getCurrent: () => api.get("/subscriptions/current"),
    createCheckout: (data) => api.post("/subscriptions/checkout", data),
    createBillingPortal: () => api.post("/subscriptions/billing-portal"),
    cancel: () => api.post("/subscriptions/cancel"),
};