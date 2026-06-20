"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useOnboardingStore from "@/store/onboardingStore";
import { onboardingAPI } from "@/lib/onboarding.api";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

/**
 * Upload/remove logic for the W-9 document slot on the Compliance Forms step.
 */
export function useComplianceDocumentUpload() {
    const { user } = useAuth();
    const { compliance, addComplianceDocument, removeComplianceDocument } = useOnboardingStore();
    const [uploadingType, setUploadingType] = useState(null);
    const [error, setError] = useState("");

    const getDocument = (documentType) =>
        compliance.documents.find((d) => d.documentType === documentType) ?? null;

    const handleDrop = (documentType) => async (files) => {
        const file = files[0];
        if (!file) return;
        setError("");

        if (file.size > MAX_FILE_SIZE) {
            setError(`${file.name} is too large. Maximum size is 25MB.`);
            return;
        }
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            setError(`${file.name} has invalid type. Only PDF, JPEG, and PNG are allowed.`);
            return;
        }
        if (!user) {
            setError("User not authenticated. Please log in again.");
            return;
        }

        setUploadingType(documentType);
        try {
            const result = await onboardingAPI.uploadDocument(file, "compliance", documentType);
            addComplianceDocument({
                id: result.id,
                path: result.path,
                fileName: result.fileName,
                fileSize: result.fileSize,
                documentType: result.documentType,
                mimeType: result.mimeType,
            });
        } catch (err) {
            setError(`Failed to upload ${file.name}. ${err.message}`);
        } finally {
            setUploadingType(null);
        }
    };

    const handleRemove = (documentType) => async () => {
        setError("");
        const index = compliance.documents.findIndex((d) => d.documentType === documentType);
        if (index === -1) return;

        const doc = compliance.documents[index];
        if (doc.id) {
            try {
                await onboardingAPI.deleteDocument(doc.id);
            } catch {
                setError(`Could not delete ${doc.fileName} from storage. Please try again.`);
                return;
            }
        }
        removeComplianceDocument(index);
    };

    return { uploadingType, error, setError, getDocument, handleDrop, handleRemove };
}