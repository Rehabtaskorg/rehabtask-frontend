import { api } from "@/lib/api";

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
    finalizeBooking: async (bookingId) => {
        return api.post(`/bookings/${bookingId}/finalize`);
    },

    // Session endpoints
    completeSession: async (bookingId) => {
        return api.post(`/sessions/${bookingId}/complete`);
    },
    confirmSession: async (sessionId) => {
        return api.post(`/sessions/${sessionId}/confirm`);
    },
    requestSessionCancellation: async (sessionId, reason) => {
        return api.post(`/sessions/${sessionId}/cancellation/request`, { reason });
    },
    approveSessionCancellation: async (sessionId) => {
        return api.post(`/sessions/${sessionId}/cancellation/approve`);
    },
    rejectSessionCancellation: async (sessionId, reason) => {
        return api.post(`/sessions/${sessionId}/cancellation/reject`, { reason });
    },
    scheduleSession: async (sessionId, scheduledDate) => {
        return api.post(`/sessions/${sessionId}/schedule`, { scheduledDate });
    },
    updateSessionTitle: async (sessionId, title) => {
        return api.post(`/sessions/${sessionId}/title`, { title });
    },
    requestSessionRevision: async (sessionId, reason) => {
        return api.post(`/sessions/${sessionId}/request-revision`, { reason });
    },
    respondToRevision: async (sessionId, dueBy) => {
        return api.post(`/sessions/${sessionId}/revision-respond`, { dueBy });
    },
    resubmitSession: async (sessionId) => {
        return api.post(`/sessions/${sessionId}/revision-resubmit`);
    },
    /**
     * Extends the revision deadline by a fixed number of days.
     * New deadline = max(currentDueBy, now) + REVISION_EXTEND_DAYS (set on backend).
     * @param {string} sessionId
     */
    extendRevision: async (sessionId) => {
        return api.post(`/sessions/${sessionId}/revision-extend`);
    },
    markSessionMissedByTherapist: async (sessionId, reason) => {
        return api.post(`/sessions/${sessionId}/mark-missed-by-therapist`, { reason });
    },
    markSessionMissedByCustomer: async (sessionId, reason) => {
        return api.post(`/sessions/${sessionId}/mark-missed-by-customer`, { reason });
    },
    markSessionAttempted: async (sessionId, reason) => {
        return api.post(`/sessions/${sessionId}/mark-attempted`, { reason });
    },

    getBookingConversation: async (bookingId) => {
        return api.get(`/bookings/${bookingId}/conversation`);
    },

    // Cancellation flow
    requestCancellation: async (bookingId, reason) => {
        return api.post(`/bookings/${bookingId}/cancellation/request`, { reason });
    },
    approveCancellation: async (bookingId) => {
        return api.post(`/bookings/${bookingId}/cancellation/approve`);
    },
    rejectCancellation: async (bookingId, reason) => {
        return api.post(`/bookings/${bookingId}/cancellation/reject`, { reason });
    },

    // Payment endpoints
    createPaymentIntent: async (bookingId) => {
        return api.post("/payments/create-intent", { bookingId });
    },
};