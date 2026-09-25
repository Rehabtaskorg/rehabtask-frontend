import { BOOKING_STATUS } from "@/lib/constants";


export const PENDING_PAYMENT_TTL_MS = 60 * 60 * 1000;

/**
 * Booking statuses where the customer still owes payment and the inline
 * payment surface must be reachable. 
 */
export const PAYABLE_BOOKING_STATUSES = Object.freeze([
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.PENDING_PAYMENT,
    BOOKING_STATUS.ACCEPTED,
]);

/**
 * Absolute deadline by which a pending_payment booking must be paid.
 * @param {Object|null|undefined} booking
 * @returns {Date|null} null when the booking is not pending_payment or has no createdAt
 */
export const getPendingPaymentDeadline = (booking) => {
    if (!booking || booking.status !== BOOKING_STATUS.PENDING_PAYMENT) return null;
    if (!booking.createdAt) return null;
    const created = new Date(booking.createdAt);
    if (Number.isNaN(created.getTime())) return null;
    return new Date(created.getTime() + PENDING_PAYMENT_TTL_MS);
};

/**
 * True when a pending_payment booking is past its TTL and is awaiting the
 * expiry cron sweep. The cron runs every 15 minutes, so a booking can sit in
 * this window for up to 15 minutes after the deadline passes.
 * @param {Object|null|undefined} booking
 * @returns {boolean}
 */
export const isPendingPaymentExpired = (booking) => {
    const deadline = getPendingPaymentDeadline(booking);
    return !!deadline && deadline.getTime() <= Date.now();
};