import { api } from "./api.js";

export const bookingsApi = {
    // Booking endpoints
    getCustomerBookings: async () => {
        return api.get("/bookings/customer");
    },
    getTherapistBookings: async () => {
        return api.get("/bookings/therapist");
    },
    getBooking: async (bookingId) => {
        return api.get(`/bookings/${bookingId}`);
    },
    rescheduleBooking: async (bookingId, newDate) => {
        return api.post(`/bookings/${bookingId}/reschedule`, { newDate });
    },
    respondToReschedule: async (bookingId, accept, reason) => {
        return api.post(`/bookings/${bookingId}/reschedule/respond`, { accept, reason });
    },

    // Session endpoints
    completeSession: async (bookingId) => {
        return api.post(`/sessions/${sessionId}/complete`);
    },
    confirmSession: async (sessionId) => {
        return api.post(`/sessions/${sessionId}/confirm`);
    },
    cancelSession: async (sessionId, reason) => {
        return api.post(`/sessions/${sessionId}/cancel`, { reason });
    },

    // Payment endpoints
    requestRefund: async (bookingId, reason) => {
        return api.post("/payments/refund", { bookingId, reason });
    },
    createPaymentIntent: async (bookingId) => {
        return api.post("/payments/create-intent", { bookingId });
    },
};