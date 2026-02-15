"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authAPi } from "@/lib/auth.api";
import { useOnboardingSync } from "@/hooks/useOnboardingSync";

export default function OnboardingBanner() {
    const router = useRouter();
    const { syncStatus } = useOnboardingSync();

    const [showBanner, setShowBanner] = useState(false);
    const [bannerType, setBannerType] = useState("incomplete");
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const checkOnboardingStatus = useCallback(async () => {
        setIsLoading(true);

        try {
            const res = await authAPi.getCurrentUser();
            const userData = res.data.data.user;

            // Only show banner for therapists
            if (userData.role !== "therapist") {
                setShowBanner(false);
                setIsLoading(false);
                return;
            }

            // Sync with backend and get real status
            const status = await syncStatus();

            if (!status) {
                setShowBanner(false);
                setIsLoading(false);
                return;
            }

            const { onboardingComplete, approvalStatus, progress: backendProgress } = status;

            // Determine banner type based on backend data
            if (!onboardingComplete) {
                // Still in onboarding
                setBannerType("incomplete");
                setProgress(backendProgress);
                setShowBanner(true);
            } else if (approvalStatus === "review" || approvalStatus === "pending") {
                // Onboarding complete, under review
                setBannerType("review");
                setShowBanner(true);
            } else if (approvalStatus === "approved") {
                // Approved - show once then hide
                const hasSeenApproval = localStorage.getItem("hasSeenApprovalBanner");
                if (!hasSeenApproval) {
                    setBannerType("approved");
                    setShowBanner(true);
                } else {
                    setShowBanner(false);
                }
            } else if (approvalStatus === "rejected") {
                // Rejected - show rejection banner
                setBannerType("rejected");
                setShowBanner(true);
            } else {
                // Unknown state, hide banner
                setShowBanner(false);
            }
        } catch (error) {
            console.error("Error checking onboarding status:", error);
            setShowBanner(false);
        } finally {
            setIsLoading(false);
        }
    }, [syncStatus]);

    useEffect(() => {
        checkOnboardingStatus();
    }, [checkOnboardingStatus]);

    const handleDismissApproved = () => {
        localStorage.setItem("hasSeenApprovalBanner", "true");
        setShowBanner(false);
    }

    const handleResumeSetup = () => {
        // Redirect based on progress - backend determines this
        router.push("/therapist/onboarding/profile");
    }

    const handleViewPending = () => router.push("/therapist/onboarding/pending")
    const handleViewSuccess = () => router.push("/therapist/approved");

    // Don't show anything while loading or if not therapist
    if (isLoading || !showBanner) return null;

    if (bannerType === "incomplete") {
        return (
            <div className="sticky top-0 z-40 border-b-2 border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark px-4 sm:px-6 lg:px-8 py-3 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-4">
                        <p className="text-sm font-semibold text-text-main dark:text-white">
                            Your profile is {progress}% complete
                        </p>
                        <div className="flex-1 max-w-xs">
                            <div className="rounded-full h-2 bg-gray-300 dark:bg-gray-700 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-sm hidden md:block text-text-muted dark:text-gray-400">
                            Finish setup to start accepting clients
                        </p>
                    </div>

                    <button
                        onClick={handleResumeSetup}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:brightness-95 transition-all"
                    >
                        {progress === 0 ? "Start Setup" : "Continue Setup"}
                    </button>
                </div>
            </div>
        );
    }

    if (bannerType === "review") {
        return (
            <div className="sticky top-0 z-40 border-b-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-4 sm:px-6 lg:px-8 py-3 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                            Your credentials are under review - we&apos;ll notify you within 24-48 hours
                        </p>
                    </div>
                    <button
                        onClick={handleViewPending}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-600 text-white hover:brightness-95 transition-all"
                    >
                        View Status
                    </button>
                </div>
            </div>
        );
    }

    if (bannerType === "approved") {
        return (
            <div className="sticky top-0 z-40 border-b-2 border-green-500 bg-green-50 dark:bg-green-900/20 px-4 sm:px-6 lg:px-8 py-3 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-bold text-green-800 dark:text-green-200">
                            🎉 Your account has been approved! You can now start accepting clients.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleViewSuccess}
                            className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:brightness-95 transition-all"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={handleDismissApproved}
                            className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors"
                            aria-label="Dismiss"
                        >
                            <svg
                                className="w-5 h-5"
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
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (bannerType === "rejected") {
        return (
            <div className="sticky top-0 z-40 border-b-2 border-red-500 bg-red-50 dark:bg-red-900/20 px-4 sm:px-6 lg:px-8 py-3 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                            Your application needs attention - please review and resubmit
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/therapist/onboarding/review")}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:brightness-95 transition-all"
                    >
                        Review Feedback
                    </button>
                </div>
            </div>
        );
    }

    return null;
}