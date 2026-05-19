"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MdLock, MdArrowBack, MdCheckCircle, MdError } from "react-icons/md";
import { ConnectAccountOnboarding } from "@stripe/react-connect-js";
import { onboardingAPI } from "@/lib/onboarding.api";
import useOnboardingStore from "@/store/onboardingStore";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import StripeConnectProvider from "@/components/stripe/StripeConnectProvider";
import { usePageTitle } from "@/hooks/usePageTitle";
import { showToast } from "@/lib/toast";

/**
 * Stripe Onboarding Page (Step 5)
 *
 * Renders Stripe's embedded ConnectAccountOnboarding component in-app —
 * no redirect to an external Stripe-hosted page.
 *
 * State machine:
 *   idle          → therapist lands on the page, no Stripe account yet
 *   creating      → POST /payments/connect/create in flight
 *   onboarding    → account exists, ConnectAccountOnboarding is rendered
 *   verifying     → onExit fired, server-side status check in flight
 *   complete      → onboarding verified complete, redirecting to dashboard
 *   error         → unrecoverable error (shown inline, user can retry)
 *
 * Security: completion is verified server-side via GET /payments/connect/status
 * (detailsSubmitted + chargesEnabled) before calling completeOnboarding().
 * onExit fires for both "finished" and "dismissed/closed" — never trust it
 * alone as a completion signal.
 */

const STATUS = {
    INITIALIZING: "initializing", // mount check in flight — show neutral spinner
    IDLE: "idle",
    CREATING: "creating",
    ONBOARDING: "onboarding",
    VERIFYING: "verifying",
    COMPLETE: "complete",
    ERROR: "error",
};

export default function StripeOnboardingPage() {
    usePageTitle("Payment Setup");
    const router = useRouter();
    const { markStepComplete, markStripeConnected } = useOnboardingStore();

    const [status, setStatus] = useState(STATUS.INITIALIZING);
    const [error, setError] = useState(null);
    const [stripeLoadError, setStripeLoadError] = useState(null);
    const [hasExistingAccount, setHasExistingAccount] = useState(false);
    // Tracks whether the embedded ConnectAccountOnboarding component has
    // started rendering its own UI. While false, we render a skeleton in
    // place of the (still-mounting) iframe so the user has visual feedback
    // during the 1-3s Stripe SDK initialization window. Reset whenever
    // the component is unmounted (status leaves ONBOARDING) so a retry
    // shows the skeleton again.
    const [embeddedFormLoaded, setEmbeddedFormLoaded] = useState(false);

    // On mount: check if the therapist already has a Stripe account from a
    // previous session or partial completion. If so, skip straight to rendering
    // the embedded component — they may just need to finish incomplete fields.
    useEffect(() => {
        const checkExistingAccount = async () => {
            try {
                const res = await onboardingAPI.checkStripeStatus();
                const { connected } = res.data.data;
                if (connected) {
                    setHasExistingAccount(true);
                    setStatus(STATUS.ONBOARDING);
                } else {
                    setStatus(STATUS.IDLE);
                }
            } catch {
                // Status check failed — fall back to IDLE so the therapist
                // can attempt account creation manually
                setStatus(STATUS.IDLE);
            }
        };

        checkExistingAccount();
    }, []);

    const handleCreateAccount = async () => {
        setStatus(STATUS.CREATING);
        setError(null);

        try {
            await onboardingAPI.createStripeAccount();
            setStatus(STATUS.ONBOARDING);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Failed to set up your payment account. Please try again.";
            setError(message);
            setStatus(STATUS.ERROR);
        }
    };

    /**
     * onExit is called by Stripe when the therapist finishes the form OR
     * simply closes/dismisses it. We always do a server-side status check
     * rather than assuming completion.
     */
    const handleOnboardingExit = useCallback(async () => {
        setStatus(STATUS.VERIFYING);
        setError(null);

        try {
            const res = await onboardingAPI.checkStripeStatus();
            const { connected, detailsSubmitted, chargesEnabled, accountId } =
                res.data.data;

            if (connected && detailsSubmitted && chargesEnabled) {
                // Full completion — mark step and finalise onboarding
                markStepComplete(5);
                markStripeConnected(accountId);

                try {
                    await onboardingAPI.completeOnboarding();
                    useOnboardingStore.getState().reset();
                } catch (completeErr) {
                    // completeOnboarding failing is non-fatal here: the therapist's
                    // profile will be marked complete by the account.updated webhook.
                    // Log it but don't block the user.
                    console.warn(
                        "[StripeOnboarding] completeOnboarding error (non-fatal):",
                        completeErr.message
                    );
                }

                setStatus(STATUS.COMPLETE);
                // Short delay so the success state is visible before redirect
                setTimeout(() => router.push("/therapist/dashboard"), 1500);
            } else if (connected && detailsSubmitted && !chargesEnabled) {
                // Details submitted but Stripe hasn't enabled charges yet (common
                // immediately after submission — verification is async on Stripe's side).
                // Show a success-ish state and redirect; webhook will update DB when ready.
                showToast.info(
                    "Your details have been submitted. We're verifying your account — this usually takes a few minutes."
                );
                markStepComplete(5);
                if (accountId) markStripeConnected(accountId);

                try {
                    await onboardingAPI.completeOnboarding();
                    useOnboardingStore.getState().reset();
                } catch { /* non-fatal */ }

                setTimeout(() => router.push("/therapist/dashboard"), 1500);
                setStatus(STATUS.COMPLETE);
            } else {
                // Dismissed without completing — go back to the component so
                // the therapist can finish the remaining fields
                setStatus(STATUS.ONBOARDING);
                setError(
                    "Your payout setup is incomplete. Please fill in all required fields to continue."
                );
            }
        } catch (err) {
            setStatus(STATUS.ONBOARDING);
            setError(
                "Could not verify your account status. Please try again or refresh the page."
            );
            console.error("[StripeOnboarding] status check failed:", err);
        }
    }, [markStepComplete, markStripeConnected, router]);

    const handleSkipForNow = async () => {
        try {
            await onboardingAPI.completeOnboarding();
            useOnboardingStore.getState().reset();
        } catch {
            // Non-fatal — admin review still works without Stripe connected
        }
        router.push("/therapist/dashboard");
    };

    const handleStripeLoadError = useCallback((err) => {
        console.error("[StripeConnectProvider] SDK load error:", err);
        setStripeLoadError(
            "Failed to load the payment setup module. Please check your connection and refresh the page."
        );
    }, []);

    // onLoaderStart fires when the embedded form first paints any UI
    // (including its own internal spinner). At that point we can hide our
    // skeleton — the user will see Stripe's iframe loader, then the form.
    const handleEmbeddedFormStart = useCallback(() => {
        setEmbeddedFormLoaded(true);
    }, []);

    const handleRetry = () => {
        setError(null);
        setStripeLoadError(null);
        setEmbeddedFormLoaded(false);
        setStatus(hasExistingAccount ? STATUS.ONBOARDING : STATUS.IDLE);
    };

    // The embedded Stripe form (ONBOARDING state) is most comfortable at the
    // full page width (max-w-4xl, matching the progress bar and page header).
    // All other states are narrow "card" layouts and look better centred at
    // max-w-2xl. We branch the container width on status so each state gets
    // the right amount of horizontal room.
    const isOnboardingStep = status === STATUS.ONBOARDING;

    return (
        <div className="min-h-screen bg-background-light  py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 text-center px-4">
                    <h1 className="text-text-main  text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Setup Payouts
                    </h1>
                    <p className="text-text-muted  text-lg">
                        Connect your bank account to receive payments for your sessions
                    </p>
                </header>

                <div className={isOnboardingStep ? "w-full" : "max-w-2xl mx-auto"}>
                    {/* ── INITIALIZING: Mount status check in flight ──────────────── */}
                    {status === STATUS.INITIALIZING && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-12 shadow-sm flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                            <p className="text-text-muted  text-sm">Loading payment setup…</p>
                        </div>
                    )}

                    {/* ── IDLE: No Stripe account yet ─────────────────────────────── */}
                    {status === STATUS.IDLE && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-8 shadow-sm">
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-text-main  mb-2">
                                        Secure Payout Setup
                                    </h2>
                                    <p className="text-text-muted  text-sm max-w-md">
                                        Set up your bank account directly in RehabTask. Your financial details are encrypted by our trusted payments processor — never stored on our servers.
                                    </p>
                                </div>

                                <div className="w-full bg-slate-50  rounded-lg p-5 text-left space-y-3 border border-border-light ">
                                    <p className="text-sm font-semibold text-text-main  mb-3">What you&apos;ll need:</p>
                                    {[
                                        "Bank account or debit card for direct deposits",
                                        "Government-issued photo ID",
                                        "Social Security Number (SSN) or EIN",
                                        "About 5–10 minutes",
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm text-text-muted ">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="w-full flex flex-col gap-3 mt-2">
                                    <button
                                        onClick={handleCreateAccount}
                                        className="w-full bg-primary hover:brightness-95 text-white px-8 py-4 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Set Up Payouts
                                    </button>

                                    <button
                                        onClick={handleSkipForNow}
                                        className="w-full text-text-muted  hover:text-text-main  px-8 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        I&apos;ll do this later
                                    </button>
                                    <p className="text-xs text-text-muted  -mt-1">
                                        You can set up payouts anytime from your Earnings page. This won&apos;t delay your review.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-text-muted  text-xs">
                                    <MdLock className="text-sm shrink-0" />
                                    <span>All financial data is encrypted and processed securely. RehabTask never stores your bank details.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── CREATING: Account creation in flight ────────────────────── */}
                    {status === STATUS.CREATING && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-12 shadow-sm flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                            <p className="text-text-main  font-semibold">Setting up your payment account…</p>
                            <p className="text-text-muted  text-sm">This only takes a moment.</p>
                        </div>
                    )}

                    {/* ── ONBOARDING: Embedded Stripe form ────────────────────────── */}
                    {status === STATUS.ONBOARDING && (
                        <div className="space-y-4">
                            {error && (
                                <div className="flex items-start gap-3 bg-amber-50  border border-amber-200  rounded-xl p-4">
                                    <MdError className="text-amber-500 text-xl shrink-0 mt-0.5" />
                                    <p className="text-amber-700  text-sm">{error}</p>
                                </div>
                            )}

                            {stripeLoadError ? (
                                <div className="bg-card-light  border border-border-light  rounded-xl p-8 text-center space-y-4">
                                    <MdError className="text-red-500 text-4xl mx-auto" />
                                    <p className="text-text-main  font-semibold">Failed to load payment setup</p>
                                    <p className="text-text-muted  text-sm">{stripeLoadError}</p>
                                    <button
                                        onClick={handleRetry}
                                        className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-95 transition-all"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : (
                                // Card wrapper matches the other onboarding steps
                                // (credentials/profile use p-6 md:p-8 + rounded-xl
                                // + shadow-sm on bg-card-light/dark). This gives
                                // the embedded Stripe form proper breathing room
                                // against the card edge.
                                <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6 md:p-8">
                                    {/* Skeleton sits in place of the embedded
                                        form during the 1-3s SDK init window.
                                        The form itself is always mounted (even
                                        when hidden) so the iframe begins loading
                                        immediately — onLoaderStart will flip
                                        embeddedFormLoaded once Stripe paints
                                        its first UI inside the iframe. */}
                                    {!embeddedFormLoaded && (
                                        <div className="animate-pulse space-y-5">
                                            <div className="h-6 w-48 bg-slate-200  rounded" />
                                            <div className="space-y-3 pt-2">
                                                <div className="h-4 w-32 bg-slate-200  rounded" />
                                                <div className="h-11 w-full bg-slate-100  rounded-lg" />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-4 w-40 bg-slate-200  rounded" />
                                                <div className="h-11 w-full bg-slate-100  rounded-lg" />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-4 w-36 bg-slate-200  rounded" />
                                                <div className="h-11 w-full bg-slate-100  rounded-lg" />
                                            </div>
                                            <div className="flex justify-end pt-2">
                                                <div className="h-10 w-28 bg-slate-200  rounded-lg" />
                                            </div>
                                        </div>
                                    )}
                                    <div className={embeddedFormLoaded ? "" : "hidden"}>
                                        <StripeConnectProvider>
                                            {/* onLoadError + onLoaderStart passed directly —
                                                ConnectComponentsProvider does not accept them */}
                                            <ConnectAccountOnboarding
                                                onExit={handleOnboardingExit}
                                                onLoadError={handleStripeLoadError}
                                                onLoaderStart={handleEmbeddedFormStart}
                                                collectionOptions={{
                                                    fields: 'eventually_due',
                                                    futureRequirements: 'include',
                                                }}
                                            />
                                        </StripeConnectProvider>
                                    </div>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    onClick={handleSkipForNow}
                                    className="text-text-muted  hover:text-text-main  text-sm font-semibold transition-colors"
                                >
                                    I&apos;ll finish this later
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── VERIFYING: Server-side status check after onExit ────────── */}
                    {status === STATUS.VERIFYING && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-12 shadow-sm flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                            <p className="text-text-main  font-semibold">Verifying your account…</p>
                            <p className="text-text-muted  text-sm">Just a moment while we confirm everything is in order.</p>
                        </div>
                    )}

                    {/* ── COMPLETE: Verified, redirecting ─────────────────────────── */}
                    {status === STATUS.COMPLETE && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-12 shadow-sm flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                <MdCheckCircle className="text-emerald-500 text-4xl" />
                            </div>
                            <p className="text-text-main  font-bold text-xl">Payout setup complete!</p>
                            <p className="text-text-muted  text-sm">Redirecting you to your dashboard…</p>
                        </div>
                    )}

                    {/* ── ERROR: Unrecoverable (account creation failed) ───────────── */}
                    {status === STATUS.ERROR && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-8 shadow-sm space-y-5">
                            <div className="flex items-start gap-3 bg-red-50  border border-red-200  rounded-xl p-4">
                                <MdError className="text-red-500 text-xl shrink-0 mt-0.5" />
                                <p className="text-red-700  text-sm">{error}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleRetry}
                                    className="w-full bg-primary hover:brightness-95 text-white px-8 py-3 rounded-lg font-bold transition-all"
                                >
                                    Try again
                                </button>
                                <button
                                    onClick={handleSkipForNow}
                                    className="w-full text-text-muted  hover:text-text-main  px-8 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    I&apos;ll do this later
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back button — only relevant when not mid-flow or initializing */}
                {[STATUS.IDLE, STATUS.ERROR].includes(status) && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => router.push("/therapist/onboarding/background-check")}
                            className="flex items-center gap-2 text-text-muted  hover:text-text-main  transition-colors"
                        >
                            <MdArrowBack className="text-lg" />
                            Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
