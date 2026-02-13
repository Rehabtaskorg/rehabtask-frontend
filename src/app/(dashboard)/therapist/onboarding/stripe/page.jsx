"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onboardingAPI } from "@/lib/onboarding.api";
import useOnboardingStore from "@/store/onboardingStore";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";

export default function StripeOnboardingPage() {
    const router = useRouter();
    const { markStepComplete } = useOnboardingStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConnectStripe = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await onboardingAPI.getStripeOnboardingLink();
            const { url } = res.data.data;

            // Mark Step 5 as complete (this will trigger 100% progress)
            markStepComplete(5);
            window.location.href = url;
        } catch (err) {
            console.error("Stripe onboarding error:", err);
            setError(err.response?.data?.message || "Failed to connect Stripe. Please try again.");
            setLoading(false);
        }
    }

    const handleSkipForNow = () => {
        markStepComplete(5);
        // Allow them to skip and go to pending status
        router.push("/therapist/onboarding/pending");
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 text-center px-4">
                    <h1 className="text-text-main dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Setup Payouts
                    </h1>
                    <p className="text-text-muted dark:text-gray-400 text-lg">
                        Connect your Stripe account to receive payments for your sessions
                    </p>
                </header>

                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-8 max-w-2xl mx-auto shadow-sm">
                    <div className="flex flex-col items-center text-center gap-6">
                        {/* Stripe Logo Placeholder */}
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">
                                Secure Payment Processing with Stripe
                            </h2>
                            <p className="text-text-muted dark:text-gray-400 max-w-md">
                                Stripe is a secure payment platform used by millions of businesses worldwide. You&apos;ll be redirected to complete a quick setup process.
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="w-full bg-muted-light dark:bg-muted-dark rounded-lg p-6 text-left space-y-3 border border-border-light dark:border-border-dark">
                            <p className="text-text-main dark:text-white font-semibold mb-3">What you&apos;ll need:</p>
                            {[
                                "Bank account information for direct deposits",
                                "Government-issued ID for verification",
                                "Social Security Number (SSN) or EIN",
                                "About 5-10 minutes to complete",
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-text-muted dark:text-gray-300 text-sm">{item}</span>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg p-4">
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col gap-3 mt-4">
                            <button
                                onClick={handleConnectStripe}
                                disabled={loading}
                                className="w-full bg-primary hover:brightness-95 text-white px-8 py-4 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Connecting to Stripe...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Connect Stripe Account
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleSkipForNow}
                                disabled={loading}
                                className="w-full text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                I&apos;ll do this later
                            </button>
                        </div>

                        {/* Security Note */}
                        <div className="flex items-center gap-2 text-text-muted dark:text-gray-500 text-xs">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>All payment information is securely encrypted and processed by Stripe</span>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => router.push("/therapist/onboarding/background-check")}
                        disabled={loading}
                        className="flex items-center gap-2 text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}