import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { paymentsApi } from "@/services/payment.api";
import { showToast } from "@/lib/toast";
import { STRIPE_STATUS } from "@/components/therapist/onboarding/stripe/constants";
import { ANALYTICS_EVENTS } from "@/lib/constants";
import { useStripeFormRetry } from "./useStripeFormRetry";

const PAYOUT_REDIRECT_DELAY_MS = 2000;

/**
 * State machine for the post-onboarding therapist payout management flow.
 * No onboarding side effects: no markStepComplete, no advanceToFinalReview,
 * no onboarding analytics, no useOnboardingStore. On success redirects to
 * /therapist/earnings.
 *
 * @returns {{ status: string, stripeStatus: object|null, error: string|null, embeddedFormLoaded: boolean, retryKey: number, loadFailed: boolean, handleCreateAccount: Function, handleOnboardingExit: Function, handleLoadError: Function, handleEmbeddedFormStart: Function, handleRetry: Function}}
 */
export function useTherapistPayouts() {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { retryKey, loadFailed, embeddedFormLoaded, handleLoadError, handleEmbeddedFormStart, resetRetry } = useStripeFormRetry();

    const [status, setStatus] = useState(STRIPE_STATUS.INITIALIZING);
    const [stripeStatus, setStripeStatus] = useState(null);
    const [error, setError] = useState(null);
    const [hasExistingAccount, setHasExistingAccount] = useState(false);

    useEffect(() => {
        const checkAccount = async () => {
            try {
                const res = await paymentsApi.getTherapistConnectStatus();
                const data = res.data.data;
                setStripeStatus(data);
                const needsAction = !data.connected || (data.pastDueCount ?? 0) > 0
                    || (data.currentlyDueCount ?? 0) > 0 || data.hasUpcomingRequirements;
                if (needsAction) trackEvent(ANALYTICS_EVENTS.PAYOUT_REPAIR_STARTED);
                if (data.connected) {
                    setHasExistingAccount(true);
                    setStatus(STRIPE_STATUS.ONBOARDING);
                } else {
                    setStatus(STRIPE_STATUS.STRUCTURE);
                }
            } catch {
                setError("Couldn't load your payout account. Please check your connection and try again.");
                setStatus(STRIPE_STATUS.ERROR);
            }
        };
        checkAccount();
    }, [trackEvent]);

    const handleCreateAccount = async (businessStructure) => {
        setStatus(STRIPE_STATUS.CREATING);
        setError(null);
        try {
            await paymentsApi.createTherapistConnectAccount({ businessStructure });
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
            const res = await paymentsApi.getTherapistConnectStatus();
            const { connected, detailsSubmitted, onboardingComplete } = res.data.data;
            const isFullyComplete = connected && onboardingComplete;
            const isPendingVerification = connected && detailsSubmitted && !onboardingComplete;

            if (!isFullyComplete && !isPendingVerification) {
                setStatus(STRIPE_STATUS.ONBOARDING);
                setError("Your payout setup is incomplete. Please fill in all required fields to continue.");
                return;
            }

            trackEvent(ANALYTICS_EVENTS.PAYOUT_REPAIR_COMPLETED);

            if (isPendingVerification) {
                showToast.info("Your details have been submitted. Stripe typically verifies accounts within 1–2 business days. We'll notify you when it's done.");
            } else {
                showToast.success("Your payout account has been updated.");
            }

            setStatus(STRIPE_STATUS.COMPLETE);
            setTimeout(() => router.push("/therapist/earnings"), PAYOUT_REDIRECT_DELAY_MS);
        } catch {
            setStatus(STRIPE_STATUS.ONBOARDING);
            setError("Could not verify your account status. Please try again or refresh the page.");
        }
    }, [router, trackEvent]);

    const handleRetry = () => {
        setError(null);
        resetRetry();
        setStatus(hasExistingAccount ? STRIPE_STATUS.ONBOARDING : STRIPE_STATUS.STRUCTURE);
    };

    return {
        status, stripeStatus, error, embeddedFormLoaded, retryKey, loadFailed,
        handleCreateAccount, handleOnboardingExit, handleLoadError, handleEmbeddedFormStart, handleRetry,
    };
}