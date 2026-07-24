import { api } from "./api";

export const faqsApi = {
    getAll: () => api.get("/faqs"),
};
