"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from "react";
import { BOOKING_STATUS } from "@/lib/constants";
import { PAYABLE_BOOKING_STATUSES } from "@/lib/bookingPayment";

export function useBookingPolling({ booking, refetch, awaitingPaymentUpdate, setAwaitingPaymentUpdate }) {
    useEffect(() => {
        if (booking && [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS].includes(booking.status)) {
            const interval = setInterval(refetch, 5000);
            return () => clearInterval(interval);
        }
    }, [booking?.status, refetch]);

    useEffect(() => {
        if (!awaitingPaymentUpdate) return;
        const interval = setInterval(refetch, 2000);
        const timeout = setTimeout(() => setAwaitingPaymentUpdate(false), 30000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [awaitingPaymentUpdate, refetch, setAwaitingPaymentUpdate]);

    useEffect(() => {
        if (awaitingPaymentUpdate && booking && !PAYABLE_BOOKING_STATUSES.includes(booking.status)) {
            setAwaitingPaymentUpdate(false);
        }
    }, [awaitingPaymentUpdate, booking?.status]);
}

export function usePaymentRedirect({ params, searchParams, setShowPaymentBanner, setAwaitingPaymentUpdate }) {
    useEffect(() => {
        const ownSuccess = searchParams.get("payment") === "success";
        const redirectStatus = searchParams.get("redirect_status");

        if (ownSuccess || redirectStatus === "succeeded") {
            setShowPaymentBanner(true);
            setAwaitingPaymentUpdate(true);
            window.history.replaceState({}, "", `/customer/bookings/${params.id}`);
            const timer = setTimeout(() => setShowPaymentBanner(false), 6000);
            return () => clearTimeout(timer);
        }

        if (redirectStatus === "failed") {
            window.history.replaceState({}, "", `/customer/bookings/${params.id}`);
        }
    }, [searchParams, params.id]);
}
