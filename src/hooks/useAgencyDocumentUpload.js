"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useAgencyOnboardingStore from "@/store/agencyOnboardingStore";
import { agencyOnboardingAPI } from "@/lib/agency.onboarding.api";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

/**
 * Upload/remove logic for a single agency document slot, keyed by documentType.
 * Shared by all four dropzones on the Upload Documents step (Step 3).
 * Upload fires immediately on drop — not deferred to submit.
 */
export function useAgencyDocumentUpload() {
    const { user } = useAuth();
    const documents = useAgencyOnboardingStore((state) => state.documents);
    const addAgencyDocument = useAgencyOnboardingStore((state) => state.addAgencyDocument);
    const removeAgencyDocument = useAgencyOnboardingStore((state) => state.removeAgencyDocument);

    const [uploadingType, setUploadingType] = useState(null);
    const [error, setError] = useState("");

    const getDocument = (documentType) =>
        documents.find((d) => d.documentType === documentType) ?? null;

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
            const result = await agencyOnboardingAPI.uploadAgencyDocument(file, documentType);
            addAgencyDocument({
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
        const index = documents.findIndex((d) => d.documentType === documentType);
        if (index === -1) return;

        const doc = documents[index];
        if (doc.id) {
            try {
                await agencyOnboardingAPI.deleteAgencyDocument(doc.id);
            } catch {
                setError(`Could not delete ${doc.fileName} from storage. Please try again.`);
                return;
            }
        }
        removeAgencyDocument(index);
    };

    return { uploadingType, error, setError, getDocument, handleDrop, handleRemove };
}