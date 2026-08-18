import { api } from "@/lib/api";

export const offersApi = {
    getOffer: async (offerId) => {
        return api.get(`/offers/${offerId}`);
    },

    getMyOffers: async () => {
        return api.get("/offers/my-offers");
    },

    withdrawOffer: async (offerId) => {
        return api.post(`/offers/${offerId}/withdraw`);
    },

    reviseOffer: async (offerId, data) => {
        return api.put(`/offers/${offerId}/revise`, data);
    },

    // Customer actions
    acceptOffer: async (offerId) => {
        return api.post(`/offers/${offerId}/accept`);
    },

    declineOffer: async (offerId) => {
        return api.post(`/offers/${offerId}/decline`);
    },

    requestChange: async (offerId, note) => {
        return api.post(`/offers/${offerId}/request-change`, { note });
    },
};