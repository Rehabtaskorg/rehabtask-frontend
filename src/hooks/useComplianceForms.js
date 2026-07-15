"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useComplianceDocumentUpload } from "@/hooks/useComplianceDocumentUpload";
import { useOnboardingDataSync } from "@/hooks/useOnboardingDataSync";
import useOnboardingStore from "@/store/onboardingStore";
import { onboardingAPI } from "@/lib/onboarding.api";
import { logger } from "@/lib/logger";

const SUB_STEPS = ["w9", "independent_contractor_agreement", "hipaa_acknowledgment", "background_check_authorization"];

/**
 * Returns true if the given sub-step has already been completed
 * based on the content snapshot from the API.
 */
const isStepComplete = (step, content) => {
    if (!content) return false;
    if (step === "w9") return Boolean(content.w9?.uploaded);
    return Boolean(content.signed?.[step]);
};

/**
 * Drives the Compliance Forms onboarding step (Step 7): 4 sub-forms shown
 * one at a time (W-9 upload, Independent Contractor Agreement, HIPAA
 * Acknowledgment, Background Check Authorization — all 3 signature
 * documents share the SignatureAgreementForm component). Resumes on the
 * first incomplete sub-step on mount, rather than always starting at 1, so
 * a returning therapist doesn't have to re-sign what they already signed.
 *
 * Back navigation skips already-completed steps — once a document is signed
 * or the W-9 uploaded, the user cannot navigate back to it.
 *
 * TODO: [NEXT] Uses manual useState+useEffect for server state instead of
 * React Query (see useFinalReview.js for the full note — same applies to
 * every onboarding step hook, migrate them together, not one at a time).
 */
export function useComplianceForms() {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncData } = useOnboardingDataSync();
    const { markStepComplete, setCurrentStep } = useOnboardingStore();
    const upload = useComplianceDocumentUpload();

    const [subStep, setSubStep] = useState(0);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 7, step_name: "compliance" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            await syncData();
            try {
                const response = await onboardingAPI.getComplianceContent();
                const { data } = response.data;
                if (cancelled) return;

                setContent(data);

                const firstIncomplete = SUB_STEPS.findIndex((step) => !isStepComplete(step, data));
                setSubStep(firstIncomplete === -1 ? SUB_STEPS.length - 1 : firstIncomplete);
            } catch (err) {
                logger.error("Failed to load compliance content:", err);
                if (!cancelled) setError("Failed to load this step. Please refresh and try again.");
            } finally {
                if (!cancelled) setInitializing(false);
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const completedSteps = useMemo(() => {
        const result = new Set();
        SUB_STEPS.forEach((step, i) => {
            if (isStepComplete(step, content)) result.add(i);
        });
        return result;
    }, [content]);

    const goToNextSubStep = () => {
        let target = subStep + 1;

        while (target < SUB_STEPS.length && completedSteps.has(target)) {
            target++;
        }

        if (target >= SUB_STEPS.length) {
            trackEvent("onboarding_step_completed", { step: 7, step_name: "compliance" });
            markStepComplete(7);
            setCurrentStep(8);
            router.push("/therapist/onboarding/stripe");
        } else {
            setSubStep(target);
        }
    };

    const goToPreviousSubStep = () => {
        let target = subStep - 1;

        while (target >= 0 && completedSteps.has(target)) {
            target--;
        }

        if (target < 0) {
            router.push("/therapist/onboarding/identity");
        } else {
            setSubStep(target);
        }
    };

    const handleW9Continue = () => {
        if (!upload.getDocument("w9")) {
            upload.setError("Please upload your signed W-9 form");
            return;
        }
        goToNextSubStep();
    };

    const handleSign = async (documentType, signature) => {
        setError("");
        setLoading(true);
        try {
            await onboardingAPI.signComplianceDocument({ documentType, signature });
            setContent((prev) => ({
                ...prev,
                signed: { ...prev?.signed, [documentType]: true },
            }));
            goToNextSubStep();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save your signature. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
        subStep,
        totalSubSteps: SUB_STEPS.length,
        currentSubStepKey: SUB_STEPS[subStep],
        completedSteps,
        content,
        initializing,
        loading,
        error,
        upload,
        onW9Continue: handleW9Continue,
        onSign: handleSign,
        onBack: goToPreviousSubStep,
    };
}
