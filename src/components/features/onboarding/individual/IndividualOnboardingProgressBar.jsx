"use client";

import { useEffect, useState } from "react";
import { useIndividualOnboardingSync } from "@/hooks/useIndividualOnboardingSync";
import useIndividualOnboardingStore from "@/stores/individualOnboardingStore";

const STEPS = [
    { number: 1, label: "Welcome" },
    { number: 2, label: "Personal Information" },
    { number: 3, label: "Medical Information" },
    { number: 4, label: "Activation" },
];

/**
 * Progress bar for the Individual onboarding flow (5 steps).
 * Syncs progress from the backend on mount and whenever currentStep changes.
 */
export function IndividualOnboardingProgressBar() {
    const currentStep = useIndividualOnboardingStore((s) => s.currentStep);
    const { syncStatus } = useIndividualOnboardingSync();

    const [progress, setProgress] = useState(0);
    const [completedCount, setCompletedCount] = useState(null);
    const [totalSteps, setTotalSteps] = useState(null);

    useEffect(() => {
        const loadProgress = async () => {
            const status = await syncStatus();
            if (status) {
                setProgress(status.progress);
                const completed = Object.values(status.steps).filter(Boolean).length;
                setCompletedCount(completed);
                setTotalSteps(Object.keys(status.steps).length);
            }
        };

        loadProgress();
    }, [syncStatus, currentStep]);

    return (
        <div className="bg-card-light rounded-xl p-6 shadow-sm border border-border-light mb-6">
            <div className="flex gap-6 justify-between items-center mb-3">
                <p className="text-text-main text-base font-semibold leading-normal">
                    Onboarding Progress
                </p>
                <p className="text-text-main text-sm font-medium leading-normal">
                    {totalSteps === null ? "Loading…" : `${completedCount} of ${totalSteps} completed`}
                </p>
            </div>

            <div className="rounded-full bg-gray-200 h-2.5 overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="text-text-muted text-sm mt-3 font-normal leading-normal">
                {progress === 100
                    ? "✓ Profile complete — your account is now active"
                    : STEPS.find((s) => s.number === currentStep)?.label || "Complete your profile to get started"}
            </p>
        </div>
    );
}