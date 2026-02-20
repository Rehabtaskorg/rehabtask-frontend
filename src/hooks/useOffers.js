"use client";

import { useQuery } from "@tanstack/react-query";
import { offersApi } from "@/lib/offers";

/**
 * Hook to fetch offer details for the session offer widget
 * Only called when contextType === "offer"
 * @param {string|null} offerId - UUID of the offer
 */
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

    return {
        offer: data ?? null,
        loading: isLoading,
        error: !!error,
    };
}