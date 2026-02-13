"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useOnboardingStore from "@/store/onboardingStore";

export default function StripeCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { markStripeConnected } = useOnboardingStore();
    const [status, setStatus] = useState("processing");

    useEffect(() => {
        const handleStripeReturn = async () => {
            try {
                // Check if Stripe onbarding was successful
                const success = searchParams.get("success");
                const accountId = searchParams.get("account_id");

                if (success === "true" && accountId) {
                    markStripeConnected(accountId);
                    setStatus("success");

                    setTimeout(() => {
                        router.push("/therapist/onboarding/pending");
                    }, 1500);
                } else if (success === "false") {
                    setStatus("error")
                } else {
                    // If no success param, still mark as complete (Stripe redirects vary)
                    // You might want to verify with backend here
                    if (accountId) {
                        markStripeConnected(accountId)
                    }

                    setTimeout(() => {
                        router.push("/therapist/onboarding/pending");
                    }, 1500);
                }
            } catch (error) {
                console.error("Stripe callback error:", error);
                setStatus("error");
            }
        }

        handleStripeReturn();
    }, [searchParams, router, markStripeConnected])

    const handleRetry = () => {
        router.push("/therapist/onboarding/stripe");
    };

    const handleSkip = () => {
        router.push("/therapist/onboarding/pending");
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                {status === "processing" && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-[#111813] dark:text-white mb-2">
                            Processing your connection...
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Please wait while we verify your Stripe account
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#111813] dark:text-white mb-2">
                            Stripe Connected Successfully!
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Redirecting you to the next step...
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[#111813] dark:text-white mb-2">
                            Connection Incomplete
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            It looks like you didn&apos;t complete the Stripe setup. You can try again or skip
                            this step for now.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleRetry}
                                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:brightness-95 transition-all"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={handleSkip}
                                className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-[#111813] dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                            >
                                Skip for Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

}