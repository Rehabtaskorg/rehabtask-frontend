"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { disputesApi } from "@/lib/disputes";

export function useMyDisputes() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["my-disputes"],
        queryFn: async () => {
            const res = await disputesApi.getMyDisputes();
            return Array.isArray(res.data.data) ? res.data.data : [];
        },
        staleTime: 30 * 1000,
    });
    return { disputes: data ?? [], loading: isLoading, error: !!error, refetch };
}

export function useDisputeDetail(id) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["dispute", id],
        queryFn: async () => {
            const res = await disputesApi.getById(id);
            return res.data.data;
        },
        enabled: !!id,
        staleTime: 60 * 1000,
    });
    return { dispute: data ?? null, loading: isLoading, error: !!error, refetch };
}

export function useCreateDispute() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => disputesApi.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["my-disputes"] }),
    });
}
