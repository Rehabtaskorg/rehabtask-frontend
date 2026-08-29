"use client";

import { useState } from "react";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import ConfirmModal from "@/components/ui/ConfirmModal";
import StripeIdleCard from "./StripeIdleCard";
import { StripeBusinessStructureStep } from "./StripeBusinessStructureStep";
import StripeEmbeddedForm from "./StripeEmbeddedForm";
import StripeStatusCard from "./StripeStatusCard";
import { useStripeOnboarding } from "./useStripeOnboarding";
import { STRIPE_STATUS } from "./constants";

/**
 * Stripe Connect onboarding shell for therapists (step 8).
 * Delegates all state and logic to useStripeOnboarding.
 *
 * @returns {JSX.Element}
 */
export default function StripeOnboardingView() {
    const router = useRouter();
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);
    const {
        status,
        error,
        embeddedFormLoaded,
        retryKey,
        loadFailed,
        handleCreateAccount,
        handleOnboardingExit,
        handleLoadError,
        handleEmbeddedFormStart,
        handleRetry,
        confirmSkipForNow,
    } = useStripeOnboarding();

    const handleSkipForNow = () => setShowSkipConfirm(true);

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 text-center px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Payment Setup
                    </h1>
                    <p className="text-text-muted text-lg">
                        Connect your bank account to receive payments for your sessions
                    </p>
                </header>

                <div className={status === STRIPE_STATUS.ONBOARDING ? "w-full" : "max-w-2xl mx-auto"}>
                    {status === STRIPE_STATUS.INITIALIZING && <StripeStatusCard variant="initializing" />}

                    {status === STRIPE_STATUS.IDLE && (
                        <StripeIdleCard onSetup={handleCreateAccount} onSkip={handleSkipForNow} />
                    )}

                    {status === STRIPE_STATUS.STRUCTURE && (
                        <StripeBusinessStructureStep onConfirm={handleCreateAccount} />
                    )}

                    {status === STRIPE_STATUS.CREATING && <StripeStatusCard variant="creating" />}

                    {status === STRIPE_STATUS.ONBOARDING && (
                        <>
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
                            <div className="text-center mt-4">
                                <button
                                    onClick={handleSkipForNow}
                                    className="text-text-muted hover:text-text-main text-sm font-semibold transition-colors"
                                >
                                    I&apos;ll finish this later
                                </button>
                            </div>
                        </>
                    )}

                    {status === STRIPE_STATUS.VERIFYING && <StripeStatusCard variant="verifying" />}

                    {status === STRIPE_STATUS.COMPLETE && <StripeStatusCard variant="complete" />}

                    {status === STRIPE_STATUS.ERROR && (
                        <StripeStatusCard
                            variant="error"
                            errorMessage={error}
                            onRetry={handleRetry}
                            onSkip={handleSkipForNow}
                        />
                    )}
                </div>

                {[STRIPE_STATUS.IDLE, STRIPE_STATUS.STRUCTURE, STRIPE_STATUS.ERROR].includes(status) && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => router.push("/therapist/onboarding/identity")}
                            className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors"
                        >
                            <MdArrowBack className="text-lg" />
                            Back
                        </button>
                    </div>
                )}

                <ConfirmModal
                    isOpen={showSkipConfirm}
                    onClose={() => setShowSkipConfirm(false)}
                    onConfirm={() => {
                        setShowSkipConfirm(false);
                        confirmSkipForNow();
                    }}
                    title="Continue without payouts?"
                    message="You can review and submit your application now, then set up payouts later from your Earnings page. This won't delay your review, but you won't be able to receive payments until payouts are set up."
                    confirmLabel="Continue to Final Review"
                    cancelLabel="Go Back"
                />
            </div>
        </div>
    );
}