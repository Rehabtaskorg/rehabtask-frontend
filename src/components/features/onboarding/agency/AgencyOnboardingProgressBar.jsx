"use client";

import { useEffect, useState } from "react";
import { useAgencyOnboardingSync } from "@/hooks/useAgencyOnboardingSync";
import useAgencyOnboardingStore from "@/store/agencyOnboardingStore";

const STEPS = [
    { number: 1, label: "Welcome" },
    { number: 2, label: "Business Profile" },
    { number: 3, label: "Upload Documents" },
    { number: 4, label: "Compliance Forms" },
    { number: 5, label: "Payment Setup" },
    { number: 6, label: "Activation" },
];

/**
 * Progress bar for the Agency onboarding flow (6 steps).
 */
export function AgencyOnboardingProgressBar() {
    const currentStep = useAgencyOnboardingStore((state) => state.currentStep);
    const { syncStatus } = useAgencyOnboardingSync();

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
                    ? "✓ Profile complete — awaiting review"
                    : STEPS.find((s) => s.number === currentStep)?.label || "Complete your profile to get started"
                }
            </p>
        </div>
    );
}
