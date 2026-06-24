"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAgencyDocumentUpload } from "@/hooks/useAgencyDocumentUpload";
import useAgencyOnboardingStore from "@/store/agencyOnboardingStore";
import { agencyOnboardingAPI } from "@/lib/agency.onboarding.api";

/**
 * Drives the Upload Required Documents step (Step 3) for agency onboarding:
 * per-slot upload state, validation of required docs, and submission.
 */
export function useAgencyUploadDocumentsForm() {
    const router = useRouter();
    const documents = useAgencyOnboardingStore((state) => state.documents);
    const markStepComplete = useAgencyOnboardingStore((state) => state.markStepComplete);
    const setCurrentStep = useAgencyOnboardingStore((state) => state.setCurrentStep);
    const upload = useAgencyDocumentUpload();

    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        upload.setError("");

        if (!upload.getDocument("home_health_license")) {
            upload.setError("State Home Health License is required.");
            return;
        }
        if (!upload.getDocument("general_liability")) {
            upload.setError("General Liability Insurance is required.");
            return;
        }
        if (!upload.getDocument("professional_liability")) {
            upload.setError("Professional Liability Insurance is required.");
            return;
        }

        setLoading(true);
        try {
            const payload = documents.map((doc) => ({
                path: doc.path,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                documentType: doc.documentType,
                mimeType: doc.mimeType,
            }));

            await agencyOnboardingAPI.saveAgencyUploadDocuments({ documents: payload });

            markStepComplete(3);
            setCurrentStep(4);
            router.push("/customer/onboarding/agency/compliance");
        } catch (err) {
            upload.setError(
                err.response?.data?.message || "Failed to save documents. Please try again."
            );
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
        goBack: () => router.push("/customer/onboarding/agency/business-profile"),
    };
}