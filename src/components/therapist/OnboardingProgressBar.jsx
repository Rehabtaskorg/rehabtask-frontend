"use client";

import { useEffect, useState } from "react";
import { useOnboardingSync } from "@/hooks/useOnboardingSync";
import useOnboardingStore from "@/store/onboardingStore";

const STEPS = [
    { number: 1, label: "Profile", route: "/therapist/onboarding/profile" },
    { number: 2, label: "Credentials", route: "/therapist/onboarding/credentials" },
    { number: 3, label: "Availability", route: "/therapist/onboarding/availability" },
    { number: 4, label: "Background Check", route: "/therapist/onboarding/background-check" },
    { number: 5, label: "Payment Setup", route: "/therapist/onboarding/stripe" },
];

export default function OnboardingProgressBar() {
    const { currentStep } = useOnboardingStore();
    const { syncStatus } = useOnboardingSync();

    const [progress, setProgress] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        const loadProgress = async () => {
            const status = await syncStatus();
            if (status) {
                setProgress(status.progress);

                // Count completed steps from backend
                const { steps } = status;
                const completed = Object.values(steps).filter(Boolean).length;
                setCompletedCount(completed);
            }
        };

        loadProgress();
    }, [syncStatus, currentStep]) // re-sync when current step changes

    return (
        <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-border-light dark:border-border-dark mb-6">
            <div className="flex gap-6 justify-between items-center mb-3">
                <p className="text-text-main dark:text-white text-base font-semibold leading-normal">
                    Onboarding Progress
                </p>
                <p className="text-text-main dark:text-white text-sm font-medium leading-normal">
                    {completedCount} of {STEPS.length} completed
                </p>
            </div>

            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-2.5 overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <p className="text-text-muted dark:text-gray-400 text-sm mt-3 font-normal leading-normal">
                {progress === 100
                    ? "✓ Profile complete - awaiting review"
                    : STEPS.find((s) => s.number === currentStep)?.label || "Complete your profile to start accepting patients"
                }
            </p>
        </div>

    );
}