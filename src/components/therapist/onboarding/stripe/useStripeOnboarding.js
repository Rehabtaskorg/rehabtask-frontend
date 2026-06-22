import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { onboardingAPI } from "@/lib/onboarding.api";
import useOnboardingStore from "@/store/onboardingStore";
import { showToast } from "@/lib/toast";
import { STRIPE_STATUS, AUTO_RETRY_DELAY_MS } from "./constants";

/**
 * State machine and all event handlers for the Stripe Connect onboarding flow.
 *
 * TODO: [NEXT] Uses manual useState+useEffect for server state instead of
 * React Query (see useFinalReview.js for the full note — same applies to
 * every onboarding step hook, migrate them together, not one at a time).
 *
 * @returns {{ status: string, error: string|null, hasExistingAccount: boolean, embeddedFormLoaded: boolean, retryKey: number, loadFailed: boolean, handleCreateAccount: Function, handleOnboardingExit: Function, handleLoadError: Function, handleEmbeddedFormStart: Function, handleRetry: Function, confirmSkipForNow: Function }}
 */
export function useStripeOnboarding() {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { markStepComplete, markStripeConnected } = useOnboardingStore();

    const [status, setStatus] = useState(STRIPE_STATUS.INITIALIZING);
    const [error, setError] = useState(null);
    const [hasExistingAccount, setHasExistingAccount] = useState(false);
    const [embeddedFormLoaded, setEmbeddedFormLoaded] = useState(false);
    const [retryKey, setRetryKey] = useState(0);
    const [loadFailed, setLoadFailed] = useState(false);
    const [hasAutoRetried, setHasAutoRetried] = useState(false);

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 8, step_name: "stripe" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const checkExistingAccount = async () => {
            try {
                const res = await onboardingAPI.checkStripeStatus();
                if (res.data.data.connected) {
                    setHasExistingAccount(true);
                    setStatus(STRIPE_STATUS.ONBOARDING);
                } else {
                    setStatus(STRIPE_STATUS.IDLE);
                }
            } catch {
                setStatus(STRIPE_STATUS.IDLE);
            }
        };
        checkExistingAccount();
    }, []);

    const handleCreateAccount = async () => {
        setStatus(STRIPE_STATUS.CREATING);
        setError(null);
        try {
            await onboardingAPI.createStripeAccount();
            setStatus(STRIPE_STATUS.ONBOARDING);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to set up your payment account. Please try again.");
            setStatus(STRIPE_STATUS.ERROR);
        }
    };

    const handleOnboardingExit = useCallback(async () => {
        setStatus(STRIPE_STATUS.VERIFYING);
        setError(null);
        try {
            const res = await onboardingAPI.checkStripeStatus();
            const { connected, detailsSubmitted, chargesEnabled, accountId } = res.data.data;
            const isFullyComplete = connected && detailsSubmitted && chargesEnabled;
            const isPendingVerification = connected && detailsSubmitted && !chargesEnabled;

            if (isFullyComplete || isPendingVerification) {
                if (isPendingVerification) {
                    showToast.info("Your details have been submitted. We're verifying your account — this usually takes a few minutes.");
                }
                trackEvent("onboarding_step_completed", { step: 8, step_name: "stripe" });
                markStepComplete(8);
                if (accountId) markStripeConnected(accountId);
                try {
                    await onboardingAPI.advanceToFinalReview();
                } catch { /* non-fatal — webhook covers this */ }
                setStatus(STRIPE_STATUS.COMPLETE);
                setTimeout(() => router.push("/therapist/onboarding/review"), 1500);
            } else {
                setStatus(STRIPE_STATUS.ONBOARDING);
                setError("Your payout setup is incomplete. Please fill in all required fields to continue.");
            }
        } catch {
            setStatus(STRIPE_STATUS.ONBOARDING);
            setError("Could not verify your account status. Please try again or refresh the page.");
        }
    }, [markStepComplete, markStripeConnected, router, trackEvent]);

    const handleLoadError = useCallback(() => {
        if (!hasAutoRetried) {
            setHasAutoRetried(true);
            setEmbeddedFormLoaded(false);
            setTimeout(() => setRetryKey((k) => k + 1), AUTO_RETRY_DELAY_MS);
        } else {
            setLoadFailed(true);
        }
    }, [hasAutoRetried]);

    const handleEmbeddedFormStart = useCallback(() => setEmbeddedFormLoaded(true), []);

    const handleRetry = () => {
        setError(null);
        setLoadFailed(false);
        setHasAutoRetried(false);
        setEmbeddedFormLoaded(false);
        setRetryKey((k) => k + 1);
        setStatus(hasExistingAccount ? STRIPE_STATUS.ONBOARDING : STRIPE_STATUS.IDLE);
    };

    const confirmSkipForNow = async () => {
        try {
            await onboardingAPI.advanceToFinalReview();
        } catch { /* non-fatal */ }
        router.push("/therapist/onboarding/review");
    };

    return {
        status,
        error,
        hasExistingAccount,
        embeddedFormLoaded,
        retryKey,
        loadFailed,
        handleCreateAccount,
        handleOnboardingExit,
        handleLoadError,
        handleEmbeddedFormStart,
        handleRetry,
        confirmSkipForNow,
    };
}