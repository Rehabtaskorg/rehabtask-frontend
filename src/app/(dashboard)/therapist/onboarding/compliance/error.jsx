"use client";

import { OnboardingStepError } from "@/components/therapist/onboarding/OnboardingStepError";

export default function Error({ error, reset }) {
    return <OnboardingStepError error={error} reset={reset} />;
}