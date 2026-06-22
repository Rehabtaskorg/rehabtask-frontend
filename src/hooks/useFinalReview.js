"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingSync } from "@/hooks/useOnboardingSync";
import { onboardingAPI } from "@/lib/onboarding.api";
import useOnboardingStore from "@/store/onboardingStore";
import { logger } from "@/lib/logger";

/**
 * Drives the Final Review step (Step 9): a read-only checklist of every
 * completed onboarding step plus Stripe's connection state, ending in the
 * one action that actually submits the application — completeOnboarding.
 *
 * TODO: [NEXT] This uses manual useState+useEffect for server state instead
 * of React Query, which CLAUDE.md specifies as the standard. Matches the
 * existing convention of all 8 other onboarding step hooks (useComplianceForms,
 * useStripeOnboarding, etc.) — none of them use React Query today. Migrating
 * just this one hook would make Step 9 inconsistent with its siblings instead
 * of consistent with the rest of the app, so it was deliberately left matching
 * the onboarding flow's existing pattern. Revisit as one full-flow migration
 * (all 9 step hooks together) when there's room to re-regression-test the
 * whole flow afterward — not as a one-off change to this file alone.
 */
export function useFinalReview() {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncStatus } = useOnboardingSync();

    const [steps, setSteps] = useState(null);
    const [stripeConnected, setStripeConnected] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 9, step_name: "review" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const [status, stripeRes] = await Promise.all([
                syncStatus(),
                onboardingAPI.checkStripeStatus().catch(() => null),
            ]);
            if (cancelled) return;

            if (status) setSteps(status.steps);
            setStripeConnected(!!stripeRes?.data?.data?.connected);
            setInitializing(false);
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = useCallback(async () => {
        setError("");
        setSubmitting(true);
        try {
            await onboardingAPI.completeOnboarding();
            trackEvent("onboarding_completed", { has_stripe_connected: stripeConnected });
            useOnboardingStore.getState().reset();
            router.push("/therapist/dashboard");
        } catch (err) {
            logger.error("Failed to complete onboarding:", err);
            setError(err.response?.data?.message || "Failed to submit your application. Please try again.");
            setSubmitting(false);
        }
    }, [router, trackEvent, stripeConnected]);

    return {
        steps,
        stripeConnected,
        initializing,
        submitting,
        error,
        onSubmit: handleSubmit,
        onBack: () => router.push("/therapist/onboarding/stripe"),
    };
}