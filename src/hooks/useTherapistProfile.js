"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { therapistApi } from "@/lib/therapist.api";

export function useTherapistProfile() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["therapist-profile"],
        queryFn: async () => {
            const res = await therapistApi.getProfile();
            return res.data.data;
        },
        staleTime: 60 * 1000,
    });

    return { profile: data ?? null, loading: isLoading, error: !!error, refetch };
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => therapistApi.updateProfile(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['therapist-profile'] }),
    });
}

export function useUpdateWorkAreas() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (workAreas) => therapistApi.updateWorkAreas(workAreas),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['therapist-profile'] }),
    });
}

export function useUpdateAvailability() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (schedule) => therapistApi.updateAvailability(schedule),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['therapist-profile'] }),
    });
}