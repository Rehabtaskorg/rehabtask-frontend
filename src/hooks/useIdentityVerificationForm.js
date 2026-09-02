"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useIdentityDocumentUpload } from "@/hooks/useIdentityDocumentUpload";
import { useOnboardingDataSync } from "@/hooks/useOnboardingDataSync";
import useOnboardingStore from "@/stores/onboardingStore";
import { onboardingAPI } from "@/services/onboarding.api";
import { identitySchema } from "@/lib/validators/onboarding.schema";

/**
 * Drives the Identity Verification onboarding step (Step 6): three document
 * upload slots (driver's license and government ID front required, government
 * ID back optional), validation, and submission.
 * Storage only — no OCR or automated verification.
 */
export function useIdentityVerificationForm() {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncData } = useOnboardingDataSync();
    const { identity, markStepComplete, setCurrentStep } = useOnboardingStore();
    const upload = useIdentityDocumentUpload();

    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 6, step_name: "identity" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;
        syncData().finally(() => {
            if (!cancelled) setInitializing(false);
        });
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        upload.setError("");

        const documents = identity.documents.map((doc) => ({
            path: doc.path,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            documentType: doc.documentType,
            mimeType: doc.mimeType,
        }));

        const parsed = identitySchema.safeParse({ documents });
        if (!parsed.success) {
            upload.setError(parsed.error.issues[0]?.message ?? "Please upload all required documents.");
            return;
        }

        setLoading(true);
        try {
            await onboardingAPI.saveIdentityVerification({ documents: parsed.data.documents });

            trackEvent("onboarding_step_completed", { step: 6, step_name: "identity" });
            markStepComplete(6);
            setCurrentStep(7);
            router.push("/therapist/onboarding/hipaa");
        } catch (err) {
            upload.setError(err.response?.data?.message || "Failed to save identity verification documents. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        initializing,
        uploadingType: upload.uploadingType,
        error: upload.error,
        getDocument: upload.getDocument,
        handleDrop: upload.handleDrop,
        handleRemove: upload.handleRemove,
        onSubmit,
        goBack: () => router.push("/therapist/onboarding/insurance"),
    };
}
