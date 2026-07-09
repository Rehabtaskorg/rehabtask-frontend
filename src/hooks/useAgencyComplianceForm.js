"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgencyDocumentUpload } from "@/hooks/useAgencyDocumentUpload";
import useAgencyOnboardingStore from "@/store/agencyOnboardingStore";
import { agencyOnboardingAPI } from "@/lib/agency.onboarding.api";

const SUB_STEPS = ["w9", "service_agreement", "hipaa_baa"];

/**
 * Drives the Compliance Forms step (Step 4) for agency onboarding.
 * Manages sub-step sequencing, W-9 upload, content fetching, and e-signing.
 */
export function useAgencyComplianceForm() {
    const router = useRouter();
    const markStepComplete = useAgencyOnboardingStore((state) => state.markStepComplete);
    const setCurrentStep = useAgencyOnboardingStore((state) => state.setCurrentStep);

    const [subStepIndex, setSubStepIndex] = useState(0);
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currentKey = SUB_STEPS[subStepIndex];
    const upload = useAgencyDocumentUpload();

    // Fetch document content when advancing to a signature sub-step
    useEffect(() => {
        if (currentKey === "w9" || content[currentKey]) return;

        agencyOnboardingAPI.getAgencyComplianceContent(currentKey)
            .then((data) => setContent((prev) => ({ ...prev, [currentKey]: data.content })))
            .catch(() => setError("Failed to load document. Please refresh and try again."));
    }, [currentKey, content]);

    const handleBack = () => {
        setError("");
        if (subStepIndex === 0) {
            router.push("/customer/onboarding/agency/upload-documents");
        } else {
            setSubStepIndex((i) => i - 1);
        }
    };

    const handleW9Continue = () => {
        if (!upload.getDocument("w9")) {
            upload.setError("Please upload your signed W-9 before continuing.");
            return;
        }
        setError("");
        setSubStepIndex(1);
    };

    const handleSign = async (signature) => {
        setError("");
        setLoading(true);
        try {
            await agencyOnboardingAPI.signAgencyCompliance({ documentType: currentKey, signature });

            const isLast = subStepIndex === SUB_STEPS.length - 1;
            if (isLast) {
                markStepComplete(4);
                setCurrentStep(5);
                router.push("/customer/onboarding/agency/activation");
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
        // W-9 props
        w9Document: upload.getDocument("w9"),
        w9Uploading: upload.uploadingType === "w9",
        w9Error: upload.error,
        onW9Drop: upload.handleDrop("w9"),
        onW9Remove: upload.handleRemove("w9"),
        handleW9Continue,
        // Signature props
        handleSign,
        handleBack,
    };
}