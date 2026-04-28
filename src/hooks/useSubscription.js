"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "@/lib/subscription.api";

export function useSubscription() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["subscription"],
        queryFn: async () => {
            const res = await subscriptionApi.getCurrent();
            return res.data.data;
        },
    });

    return {
        subscription: data?.subscription ?? null,
        usage: data?.usage ?? { activeRequests: 0, activeTherapists: 0 },
        loading: isLoading,
        error,
        refetch,
    };
}

export function useCreateCheckout() {
    const mutation = useMutation({
        mutationFn: async ({ planType, billingInterval }) => {
            const res = await subscriptionApi.createCheckout({ planType, billingInterval });
            return res.data.data;
        },
        onSuccess: (data) => {
            if (data?.url) {
                window.location.href = data.url;
            }
        },
    });

    return mutation;
}

export function useCreateBillingPortal() {
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await subscriptionApi.createBillingPortal();
            return res.data.data;
        },
        onSuccess: (data) => {
            if (data?.url) {
                window.location.href = data.url;
            }
        },
    });

    return mutation;
}

export function useCancelSubscription() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await subscriptionApi.cancel();
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
    });

    return mutation;
}

export function useResumeSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const res = await subscriptionApi.resume();
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
    });
}

export function useUpgradeSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ planType, billingInterval }) => {
            const res = await subscriptionApi.upgrade({ planType, billingInterval });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
    });
}

export function useDowngradeSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ planType, billingInterval }) => {
            const res = await subscriptionApi.downgrade({ planType, billingInterval });
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
    });
}