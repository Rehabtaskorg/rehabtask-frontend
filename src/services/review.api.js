import { api } from "@/lib/api";

export const reviewsApi = {
    createReview: async (data) => {
        // data: { bookingId, rating, comment? }
        return api.post("/reviews", data);
    },
    getMyReviews: async () => {
        return api.get("/reviews/my-reviews");
    },
};