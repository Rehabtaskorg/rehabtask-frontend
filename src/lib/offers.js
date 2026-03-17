import { api } from "./api";

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
};