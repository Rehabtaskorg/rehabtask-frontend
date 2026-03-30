"use client";

import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/public.api";

export function usePlatformStats() {
    return useQuery({
        queryKey: ["public", "stats"],
        queryFn: () => publicApi.getPlatformStats().then((r) => r.data.data),
        staleTime: 5 * 60 * 1000,
    });
}

export function useSearchTherapists(params) {
    return useQuery({
        queryKey: ["public", "therapists", params],
        queryFn: () => publicApi.searchTherapists(params).then((r) => r.data.data),
    });
}

export function useFeaturedTherapists() {
    return useQuery({
        queryKey: ["public", "therapists", "featured"],
        queryFn: () => publicApi.searchTherapists({ sortBy: "rating", limit: 6 }).then((r) => r.data.data),
        staleTime: 5 * 60 * 1000,
    });
}

export function useTherapistPublicProfile(id) {
    return useQuery({
        queryKey: ["public", "therapist", id],
        queryFn: () => publicApi.getTherapistProfile(id).then((r) => r.data.data),
        enabled: !!id,
    });
}

export function useTherapistReviews(id, page = 1) {
    return useQuery({
        queryKey: ["public", "therapist", id, "reviews", page],
        queryFn: () => publicApi.getTherapistReviews(id, { page, limit: 5 }).then((r) => r.data.data),
        enabled: !!id,
    });
}

export function usePublicRequests(params) {
    return useQuery({
        queryKey: ["public", "requests", params],
        queryFn: () => publicApi.browseRequests(params).then((r) => r.data.data),
    });
}
