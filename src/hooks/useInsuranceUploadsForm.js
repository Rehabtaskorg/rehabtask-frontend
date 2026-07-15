"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useInsuranceDocumentUpload } from "@/hooks/useInsuranceDocumentUpload";
import { useOnboardingDataSync } from "@/hooks/useOnboardingDataSync";
import useOnboardingStore from "@/store/onboardingStore";
import { onboardingAPI } from "@/lib/onboarding.api";

/**
 * Drives the Insurance Documentation onboarding step (Step 5): home-visits
 * toggle, three document upload slots, validation, and submission.
 */
export function useInsuranceUploadsForm() {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const { syncData } = useOnboardingDataSync();
    const { insurance, updateInsurance, markStepComplete, setCurrentStep } = useOnboardingStore();
    const upload = useInsuranceDocumentUpload();

    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        trackEvent("onboarding_step_viewed", { step: 5, step_name: "insurance" });
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

    const handleToggleHomeVisits = (e) => updateInsurance({ doesHomeVisits: e.target.checked });

    const onSubmit = async (e) => {
        e.preventDefault();
        upload.setError("");

        if (!upload.getDocument("general_liability")) {
            upload.setError("General Liability insurance is required");
            return;
        }
        if (!upload.getDocument("professional_liability")) {
            upload.setError("Professional Liability insurance is required");
            return;
        }
        if (insurance.doesHomeVisits && !upload.getDocument("auto_insurance")) {
            upload.setError("Auto Insurance is required because you indicated you perform home visits");
            return;
        }

        setLoading(true);
        try {
            const documents = insurance.documents.map((doc) => ({
                path: doc.path,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                documentType: doc.documentType,
                mimeType: doc.mimeType,
            }));

            await onboardingAPI.saveInsurance({ doesHomeVisits: insurance.doesHomeVisits, documents });

            trackEvent("onboarding_step_completed", { step: 5, step_name: "insurance" });
            markStepComplete(5);
            setCurrentStep(6);
            router.push("/therapist/onboarding/identity");
        } catch (err) {
            upload.setError(err.response?.data?.message || "Failed to save insurance documentation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return {
        insurance,
        loading,
        initializing,
        uploadingType: upload.uploadingType,
        error: upload.error,
        getDocument: upload.getDocument,
        handleToggleHomeVisits,
        handleDrop: upload.handleDrop,
        handleRemove: upload.handleRemove,
        onSubmit,
        goBack: () => router.push("/therapist/onboarding/availability"),
    };
}
