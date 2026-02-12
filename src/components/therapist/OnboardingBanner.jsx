"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { authAPi } from "@/lib/auth.api";
import useOnboardingStore from "@/store/onboardingStore";

export default function OnboardingBanner() {
    const router = useRouter();
    const [showBanner, setShowBanner] = useState(false);
    const [bannerType, setBannerType] = useState("incomplete"); // incomplete, review, approved
    const [progress, setProgress] = useState(0);
    const { getProgress } = useOnboardingStore();

    const checkOnboardingStatus = useCallback(async () => {
        try {
            const res = await authAPi.getCurrentUser();
            const userData = res.data.data.user;

            if (userData.role === "therapist") {
                const profile = userData.therapistProfile;
                const isComplete = profile?.onboardingComplete || false;
                const approvalStatus = profile?.approvalStatus || "pending";

                if (!isComplete) {
                    setBannerType("incomplete");
                    setProgress(getProgress());
                    setShowBanner(true);
                } else if (approvalStatus === "review" || approvalStatus === "pending") {
                    setBannerType("review");
                    setShowBanner(true);
                } else if (approvalStatus === "approved") {
                    // Only show approvded banner once, then hide it
                    const hasSeenApproval = localStorage.getItem("hasSeenApprovalBanner");
                    if (!hasSeenApproval) {
                        setBannerType("approved");
                        setShowBanner(true);
                    }
                }
            }
        } catch (error) {
            console.error("Error checking onboarding status:", error);
        }
    }, [getProgress]);

    useEffect(() => {
        const initialize = async () => {
            await checkOnboardingStatus()
        }
        initialize();
    }, [checkOnboardingStatus]);

    const handleDismissApproved = () => {
        localStorage.setItem("hasSeenApprovalBanner", "true");
        setShowBanner(false);
    }

    const handleResumeSetup = () => {
        const currentStep = useOnboardingStore.getState().currentStep;
        const stepRoutes = {
            1: "/therapist/onboarding/profile",
            2: "/therapist/onboarding/credentials",
            3: "/therapist/onboarding/availability",
            4: "/therapist/onboarding/background-check",
            5: "/therapist/onboarding/stripe",
        };

        router.push(stepRoutes[currentStep] || "/therapist/onboarding/profile");
    }

    const handleViewPending = () => router.push("/therapist/onboarding/pending")

    const handleViewSuccess = () => router.push("/therapist/approved");

    if (!showBanner) return null;

    // Reusable styles
    const baseBanner =
        "sticky top-0 z-40 border-b-2 px-4 sm:px-6 lg:px-8 py-3 transition-colors duration-200";

    const buttonStyle =
        "px-4 py-2 rounded-lg text-sm font-semibold transition-colors";

    const textPrimary = "text-[var(--color-text-main)] dark:text-white";
    const textMuted = "text-[var(--color-text-muted)] dark:text-gray-400";
    const bgLight = "bg-[var(--color-background-light)] dark:bg-[var(--color-background-dark)]";
    const borderSubtle = "border-[var(--color-border-subtle)] dark:border-gray-700";
    const primaryBtn = `bg-[var(--color-primary)] text-white hover:brightness-95`;
    const successBtn = `bg-[var(--color-success)] text-white hover:brightness-95`;

    if (bannerType === "incomplete") {
        return (
            <div className={`${baseBanner} ${bgLight} ${borderSubtle}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-1 items-center gap-4">
                        <p className={`text-sm font-semibold ${textPrimary}`}>
                            Your profile is {progress}% complete
                        </p>
                        <div className="flex-1 max-w-xs">
                            <div className="rounded-full h-2 bg-gray-300 dark:bg-gray-700 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${progress}%`,
                                        backgroundColor: "var(--color-primary)",
                                    }}
                                ></div>
                            </div>
                        </div>
                        <p className={`text-sm hidden md:block ${textMuted}`}>
                            Finish setup to start accepting clients
                        </p>
                    </div>

                    <button
                        onClick={handleResumeSetup}
                        className={`${buttonStyle} ${primaryBtn}`}
                    >
                        Resume Setup
                    </button>
                </div>
            </div>
        );
    }

    if (bannerType === "review") {
        return (
            <div className={`${baseBanner} ${bgLight} ${borderSubtle}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <p className={`text-sm font-semibold ${textPrimary}`}>
                        Your credentials are under review
                    </p>
                    <button
                        onClick={handleViewPending}
                        className={`${buttonStyle} ${primaryBtn}`}
                    >
                        View Status
                    </button>
                </div>
            </div>
        );
    }

    if (bannerType === "approved") {
        return (
            <div className={`${baseBanner} ${bgLight} border-success`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <p className={`text-sm font-bold text-success`}>
                        🎉 Your account has been approved!
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleViewSuccess}
                            className={`${buttonStyle} ${successBtn}`}
                        >
                            Get Started
                        </button>
                        <button
                            onClick={handleDismissApproved}
                            className="p-2 text-success hover:text-text-main dark:hover:text-white transition-colors"
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

    return null;
}