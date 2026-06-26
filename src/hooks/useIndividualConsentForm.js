"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useIndividualOnboardingStore from "@/store/individualOnboardingStore";
import { individualOnboardingAPI } from "@/lib/individual.onboarding.api";

const SUB_STEPS = ["hipaa_consent", "treatment_consent"];

/**
 * Drives the Consent Forms step (Step 4) for individual onboarding.
 * Manages sub-step sequencing, content fetching, and e-signing with
 * optional representative fields.
 */
export function useIndividualConsentForm() {
    const router = useRouter();
    const markStepComplete = useIndividualOnboardingStore((s) => s.markStepComplete);
    const setCurrentStep = useIndividualOnboardingStore((s) => s.setCurrentStep);

    const [subStepIndex, setSubStepIndex] = useState(0);
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currentKey = SUB_STEPS[subStepIndex];

    useEffect(() => {
        if (content[currentKey]) return;

        individualOnboardingAPI
            .getConsentContent(currentKey)
            .then((data) => setContent((prev) => ({ ...prev, [currentKey]: data.content })))
            .catch(() => setError("Failed to load document. Please refresh and try again."));
    }, [currentKey, content]);

    const handleBack = () => {
        setError("");
        if (subStepIndex === 0) {
            router.push("/customer/onboarding/individual/medical-info");
        } else {
            setSubStepIndex((i) => i - 1);
        }
    };

    const handleSign = async (signature, representativeFields) => {
        setError("");
        setLoading(true);
        try {
            const payload = {
                documentType: currentKey,
                signature,
                ...representativeFields,
            };
            await individualOnboardingAPI.signConsent(payload);

            const isLast = subStepIndex === SUB_STEPS.length - 1;
            if (isLast) {
                markStepComplete(4);
                setCurrentStep(5);
                router.push("/customer/onboarding/individual/activation");
            } else {
                setSubStepIndex((i) => i + 1);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save signature. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
        subStepIndex,
        totalSubSteps: SUB_STEPS.length,
        currentKey,
        content,
        loading,
        error,
        handleSign,
        handleBack,
    };
}