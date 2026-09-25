import { api } from "@/lib/api";

export const subscriptionApi = {
    getCurrent: () => api.get("/subscriptions/current"),
    createCheckout: (data) => api.post("/subscriptions/checkout", data),
    createBillingPortal: () => api.post("/subscriptions/billing-portal"),
    cancel: () => api.post("/subscriptions/cancel"),
    resume: () => api.post("/subscriptions/resume"),
    previewUpgrade: (data) => api.post("/subscriptions/preview-upgrade", data),
    upgrade: (data) => api.post("/subscriptions/upgrade", data),
    downgrade: (data) => api.post("/subscriptions/downgrade", data),
    cancelDowngrade: () => api.delete("/subscriptions/downgrade"),
};