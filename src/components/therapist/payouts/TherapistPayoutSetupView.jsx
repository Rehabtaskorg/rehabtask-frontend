"use client";

import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import { StripeBusinessStructureStep } from "@/components/therapist/onboarding/stripe/StripeBusinessStructureStep";
import StripeEmbeddedForm from "@/components/therapist/onboarding/stripe/StripeEmbeddedForm";
import StripeStatusCard from "@/components/therapist/onboarding/stripe/StripeStatusCard";
import { STRIPE_STATUS } from "@/components/therapist/onboarding/stripe/constants";
import { useTherapistPayouts } from "./useTherapistPayouts";
import { PAYOUT_HEADINGS, getPayoutHeadingKey } from "./payoutHeadings";

/**
 * Post-onboarding Stripe payout management shell for approved and pending therapists.
 * No progress bar, no skip modal, no onboarding side effects.
 * On success redirects to /therapist/earnings.
 *
 * @returns {JSX.Element}
 */
export function TherapistPayoutSetupView() {
    const { canAccessMarketplace } = useTherapistAccess();
    const backHref = canAccessMarketplace ? "/therapist/earnings" : "/therapist/account-settings";
    const backLabel = canAccessMarketplace ? "Back to Earnings" : "Back to Account Settings";

    const {
        status,
        stripeStatus,
        error,
        embeddedFormLoaded,
        retryKey,
        loadFailed,
        handleCreateAccount,
        handleOnboardingExit,
        handleLoadError,
        handleEmbeddedFormStart,
        handleRetry,
    } = useTherapistPayouts();

    const headingKey = getPayoutHeadingKey(stripeStatus);
    const { h1, subheading } = PAYOUT_HEADINGS[headingKey];

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <div className="mb-6">
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-text-muted hover:text-text-main transition-colors text-sm font-semibold"
                >
                    <MdArrowBack className="text-lg" />
                    {backLabel}
                </Link>
            </div>

            {status !== STRIPE_STATUS.INITIALIZING && (
                <header className="mb-8 text-center px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        {h1}
                    </h1>
                    <p className="text-text-muted text-lg">{subheading}</p>
                </header>
            )}

            <div className={status === STRIPE_STATUS.ONBOARDING ? "w-full" : "max-w-2xl mx-auto"}>
                {status === STRIPE_STATUS.INITIALIZING && <StripeStatusCard variant="initializing" />}

                {status === STRIPE_STATUS.STRUCTURE && (
                    <StripeBusinessStructureStep onConfirm={handleCreateAccount} showProductDescription />
                )}

                {status === STRIPE_STATUS.CREATING && <StripeStatusCard variant="creating" />}

                {status === STRIPE_STATUS.ONBOARDING && (
                    <StripeEmbeddedForm
                        onExit={handleOnboardingExit}
                        onRetry={handleRetry}
                        retryKey={retryKey}
                        embeddedFormLoaded={embeddedFormLoaded}
                        onLoaderStart={handleEmbeddedFormStart}
                        onLoadError={handleLoadError}
                        loadFailed={loadFailed}
                        incompleteError={error}
                    />
                )}

                {status === STRIPE_STATUS.VERIFYING && <StripeStatusCard variant="verifying" />}

                {status === STRIPE_STATUS.COMPLETE && <StripeStatusCard variant="payoutUpdated" />}

                {status === STRIPE_STATUS.ERROR && (
                    <StripeStatusCard
                        variant="error"
                        errorMessage={error}
                        onRetry={handleRetry}
                        onSkip={() => (window.location.href = backHref)}
                    />
                )}
            </div>
        </div>
    );
}