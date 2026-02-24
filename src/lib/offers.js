import { api } from "./api";

/**
 * Offer related API calls
 */
export const offersApi = {
    /**
     * Get a single offer by ID (therapist read-only view)
     * @param {string} offerId - UUID of the offer
     */
    getOffer: async (offerId) => {
        return api.get(`/offers/${offerId}`);
    }
}