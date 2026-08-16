"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useOnboardingSync } from "@/hooks/useOnboardingSync";
import { onboardingAPI } from "@/services/onboarding.api";
import useOnboardingStore from "@/stores/onboardingStore";
import { logger } from "@/lib/logger";

/**
 * Drives the Final Review step (Step 8): a read-only checklist of every
 * completed onboarding step plus Stripe's connection state, ending in the
 * one action that actually submits the application — completeOnboarding.
 */
export function useFinalReview() {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncStatus } = useOnboardingSync();

    const [steps, setSteps] = useState(null);
    const [stripeOnboardingComplete, setStripeOnboardingComplete] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const submittingRef = useRef(false);

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 8, step_name: "review" });
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
            setStripeOnboardingComplete(!!stripeRes?.data?.data?.onboardingComplete);
            setInitializing(false);
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = useCallback(async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;

        setError("");
        setSubmitting(true);
        try {
            await onboardingAPI.completeOnboarding();
            trackEvent("onboarding_completed", { has_stripe_connected: stripeOnboardingComplete });
            useOnboardingStore.getState().reset();
            router.push("/therapist/dashboard");
        } catch (err) {
            logger.error("Failed to complete onboarding:", err);
            setError(err.response?.data?.message || "Failed to submit your application. Please try again.");
            setSubmitting(false);
        } finally {
            submittingRef.current = false;
        }
    }, [router, trackEvent, stripeOnboardingComplete]);

    return {
        steps,
        stripeOnboardingComplete,
        initializing,
        submitting,
        error,
        onSubmit: handleSubmit,
        onBack: () => router.push("/therapist/onboarding/stripe"),

    };
}