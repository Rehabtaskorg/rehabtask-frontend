"use client";

import { useQuery } from "@tanstack/react-query";
import { therapistsPublicApi } from "@/lib/therapistPublic.api";

export function useTherapistSearch(filters) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["therapist-search", filters],
        queryFn: async () => {
            const res = await therapistsPublicApi.searchTherapists(filters);
            return res.data.data;
        },
        staleTime: 30 * 1000,
    });

    return {
        therapists: data?.therapists ?? [],
        pagination: data?.pagination ?? null,
        loading: isLoading,
        error: !!error,
        refetch,
    }
};

export function useTherapistPublicProfile(therapistId) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["therapist-profile-public", therapistId],
        queryFn: async () => {
            const res = await therapistsPublicApi.getTherapistProfile(therapistId);
            return res.data.data;
        },
        enabled: !!therapistId,
        staleTime: 60 * 1000,
    });

    return {
        therapist: data ?? null,
        loading: isLoading,
        error: !!error,
        refetch,
    };
}

export function useTherapistReviews(therapistId, page = 1, limit = 10) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["therapist-reviews", therapistId, page],
        queryFn: async () => {
            const res = await therapistsPublicApi.getTherapistReviews(therapistId, page, limit);
            return res.data.data;
        },
        enabled: !!therapistId,
        staleTime: 60 * 1000,
    });

    return {
        reviews: data?.reviews ?? [],
        pagination: data?.pagination ?? null,
        loading: isLoading,
        error: !!error,
    }
}