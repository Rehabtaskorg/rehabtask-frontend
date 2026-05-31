"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { subscriptionApi } from "@/lib/subscription.api";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

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

/**
 * Upgrades the customer's subscription plan.
 * Handles 3DS authentication for saved cards — Stripe returns requires_action
 * with a clientSecret and the paymentMethodId it attempted, so we complete
 * the challenge client-side without needing the page to pass a payment method.
 *
 * @param {string} opts.planType
 * @param {string} opts.billingInterval
 */
export function useUpgradeSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ planType, billingInterval }) => {
            const res = await subscriptionApi.upgrade({ planType, billingInterval });
            const result = res.data.data;

            if (result.status !== "requires_action") return result;

            if (!result.clientSecret) throw new Error("3DS authentication required but no client secret returned.");

            const stripe = await stripePromise;
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                result.clientSecret,
                result.paymentMethodId ? { payment_method: result.paymentMethodId } : {}
            );

            if (error) throw new Error(error.message);
            if (paymentIntent?.status !== "succeeded") throw new Error("Payment could not be completed. Please try again.");

            return { status: "succeeded" };
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