"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/services/booking.api";

export function useCustomerBookings() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["customer-bookings"],
        queryFn: async () => {
            const res = await bookingsApi.getCustomerBookings();
            return Array.isArray(res.data.data) ? res.data.data : [];
        },
        staleTime: 30 * 1000,
    });
    return { bookings: data ?? [], loading: isLoading, error: !!error, refetch };
}

export function useTherapistBookings() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["therapist-bookings"],
        queryFn: async () => {
            const res = await bookingsApi.getTherapistBookings();
            return Array.isArray(res.data.data) ? res.data.data : [];
        },
        staleTime: 30 * 1000,
    });
    return { bookings: data ?? [], loading: isLoading, error: !!error, refetch };
}

export function useBookingDetail(bookingId) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["booking", bookingId],
        queryFn: async () => {
            const res = await bookingsApi.getBooking(bookingId);
            return res.data.data;
        },
        enabled: !!bookingId,
        staleTime: 60 * 1000,
    });
    return { booking: data ?? null, loading: isLoading, error: !!error, refetch };
}