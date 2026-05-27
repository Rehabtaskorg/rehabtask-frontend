"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import StripeOnboardingView from "@/components/therapist/onboarding/stripe/StripeOnboardingView";

/**
 * Stripe payout setup — step 5 of therapist onboarding.
 *
 * @returns {JSX.Element}
 */
export default function StripeOnboardingPage() {
    usePageTitle("Payment Setup");
    return <StripeOnboardingView />;
}