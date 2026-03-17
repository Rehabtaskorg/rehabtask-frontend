"use client";

import { useQuery } from "@tanstack/react-query";
import { offersApi } from "@/lib/offers";

export function useOfferDetails(offerId) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["offer", offerId],
        queryFn: async () => {
            const res = await offersApi.getOffer(offerId);
            return res.data.data.offer;
        },
        enabled: !!offerId,
        staleTime: 60 * 1000,
    });

    return { offer: data ?? null, loading: isLoading, error: !!error };
}

export function useMyOffers() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["my-offers"],
        queryFn: async () => {
            const res = await offersApi.getMyOffers();
            return Array.isArray(res.data.data) ? res.data.data : [];
        },
        staleTime: 30 * 1000,
    });

    return { offers: data ?? [], loading: isLoading, error: !!error, refetch };
}