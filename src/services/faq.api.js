import { api } from "@/lib/api";

export const faqsApi = {
    getAll: () => api.get("/faqs"),
};
