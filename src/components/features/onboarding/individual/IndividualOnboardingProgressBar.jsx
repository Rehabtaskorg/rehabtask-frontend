"use client";

import useIndividualOnboardingStore from "@/store/individualOnboardingStore";

const STEPS = [
    { number: 1, label: "Welcome" },
    { number: 2, label: "Personal Information" },
    { number: 3, label: "Medical Information" },
    { number: 4, label: "Consent Forms" },
    { number: 5, label: "Activation" },
];

const TRACKABLE_STEPS = STEPS.filter((s) => s.number > 1 && s.number < 5);
const TOTAL = TRACKABLE_STEPS.length;

/**
 * @param {{ completedSteps: number[] }} props
 */
export function IndividualOnboardingProgressBar() {
    const currentStep = useIndividualOnboardingStore((s) => s.currentStep);
    const completedSteps = useIndividualOnboardingStore((s) => s.completedSteps);

    const completedCount = TRACKABLE_STEPS.filter((s) => completedSteps.includes(s.number)).length;
    const progress = TOTAL === 0 ? 0 : Math.round((completedCount / TOTAL) * 100);
    const currentLabel = STEPS.find((s) => s.number === currentStep)?.label ?? "";

    return (
        <div className="bg-card-light rounded-xl p-6 shadow-sm border border-border-light mb-6">
            <div className="flex gap-6 justify-between items-center mb-3">
                <p className="text-text-main text-base font-semibold leading-normal">
                    Onboarding Progress
                </p>
                <p className="text-text-main text-sm font-medium leading-normal">
                    {completedCount} of {TOTAL} completed
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
                    : currentLabel || "Complete your profile to get started"}
            </p>
        </div>
    );
}