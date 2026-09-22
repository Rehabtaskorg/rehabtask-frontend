"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    CUSTOMER_KEYS,
    fetchCustomerProfile,
    updateCustomerProfile,
} from "@/services/customer.api";

/**
 * Read the authenticated customer's profile.
 *
 * @returns {{ profile: Object|null, loading: boolean, error: boolean, refetch: Function }}
 */
export function useCustomerProfile() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: CUSTOMER_KEYS.profile(),
        queryFn: fetchCustomerProfile,
        staleTime: 60 * 1000,
    });

    return { profile: data ?? null, loading: isLoading, error: !!error, refetch };
}

/**
 * Update the authenticated customer's profile and refresh the cached read.
 * Callers pass only changed fields — see `pickChangedFields`.
 *
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useUpdateCustomerProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => updateCustomerProfile(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.profile() }),
    });
}
