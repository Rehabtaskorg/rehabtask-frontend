"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/services/review.api";

export function useCreateReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => reviewsApi.createReview(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["therapist-reviews"] });
            queryClient.invalidateQueries({ queryKey: ["therapist-profile-public"] });
            queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
        },
    });
}

export function useMyReviews() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["my-reviews"],
        queryFn: async () => {
            const res = await reviewsApi.getMyReviews();
            return Array.isArray(res.data.data) ? res.data.data : [];
        },
        staleTime: 30 * 1000,
    });

    return {
        reviews: data ?? [],
        loading: isLoading,
        error: !!error,
    };
}