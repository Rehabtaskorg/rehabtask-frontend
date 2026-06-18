"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useIdentityDocumentUpload } from "@/hooks/useIdentityDocumentUpload";
import useOnboardingStore from "@/store/onboardingStore";
import { onboardingAPI } from "@/lib/onboarding.api";

/**
 * Drives the Identity Verification onboarding step (Step 6): two document
 * upload slots (front required, back optional), validation, and submission.
 * Storage only — no OCR or automated verification.
 */
export function useIdentityVerificationForm() {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { identity, markStepComplete, setCurrentStep } = useOnboardingStore();
    const upload = useIdentityDocumentUpload();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 6, step_name: "identity" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        upload.setError("");

        if (!upload.getDocument("government_id_front")) {
            upload.setError("A front photo of your government ID is required");
            return;
        }

        setLoading(true);
        try {
            const documents = identity.documents.map((doc) => ({
                path: doc.path,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                documentType: doc.documentType,
                mimeType: doc.mimeType,
            }));

            await onboardingAPI.saveIdentityVerification({ documents });

            trackEvent("onboarding_step_completed", { step: 6, step_name: "identity" });
            markStepComplete(6);
            setCurrentStep(7);
            router.push("/therapist/onboarding/compliance");
        } catch (err) {
            upload.setError(err.response?.data?.message || "Failed to save identity verification documents. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        uploadingType: upload.uploadingType,
        error: upload.error,
        getDocument: upload.getDocument,
        handleDrop: upload.handleDrop,
        handleRemove: upload.handleRemove,
        onSubmit,
        goBack: () => router.push("/therapist/onboarding/insurance"),
    };
}
