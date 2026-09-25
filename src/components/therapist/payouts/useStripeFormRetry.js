import { useState, useCallback } from "react";
import { AUTO_RETRY_DELAY_MS } from "@/components/therapist/onboarding/stripe/constants";

/**
 * Manages the Stripe embedded SDK load-retry cycle.
 * Used by both useStripeOnboarding and useTherapistPayouts.
 *
 * @returns {{ retryKey: number, loadFailed: boolean, embeddedFormLoaded: boolean, handleLoadError: Function, handleEmbeddedFormStart: Function, resetRetry: Function }}
 */
export function useStripeFormRetry() {
    const [retryKey, setRetryKey] = useState(0);
    const [loadFailed, setLoadFailed] = useState(false);
    const [embeddedFormLoaded, setEmbeddedFormLoaded] = useState(false);
    const [hasAutoRetried, setHasAutoRetried] = useState(false);

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

    const resetRetry = useCallback(() => {
        setLoadFailed(false);
        setHasAutoRetried(false);
        setEmbeddedFormLoaded(false);
        setRetryKey((k) => k + 1);
    }, []);

    return { retryKey, loadFailed, embeddedFormLoaded, handleLoadError, handleEmbeddedFormStart, resetRetry };
}