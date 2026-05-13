"use client";

import { useEffect } from "react";

export function useBookingPolling({ booking, refetch, awaitingPaymentUpdate, setAwaitingPaymentUpdate }) {
    useEffect(() => {
        if (booking && ["confirmed", "in_progress"].includes(booking.status)) {
            const interval = setInterval(refetch, 5000);
            return () => clearInterval(interval);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [booking?.status, refetch]);

    useEffect(() => {
        if (!awaitingPaymentUpdate) return;
        const interval = setInterval(refetch, 2000);
        const timeout = setTimeout(() => setAwaitingPaymentUpdate(false), 30000);
        return () => { clearInterval(interval); clearTimeout(timeout); };
    }, [awaitingPaymentUpdate, refetch]);

    useEffect(() => {
        if (awaitingPaymentUpdate && booking && !["pending", "accepted"].includes(booking.status)) {
            setAwaitingPaymentUpdate(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, params.id]);
}
