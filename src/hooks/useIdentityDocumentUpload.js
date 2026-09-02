"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import useOnboardingStore from "@/stores/onboardingStore";
import { onboardingAPI } from "@/services/onboarding.api";
import {
    PHOTO_ONLY_DOCUMENT_TYPES,
    PHOTO_MIME_TYPES,
    DOCUMENT_MIME_TYPES,
} from "@/lib/constants";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const allowedMimeTypesFor = (documentType) =>
    PHOTO_ONLY_DOCUMENT_TYPES.includes(documentType) ? PHOTO_MIME_TYPES : DOCUMENT_MIME_TYPES;

/**
 * Upload/remove logic for a single identity document slot, keyed by
 * documentType. Shared by all dropzones on the Identity Verification step.
 */
export function useIdentityDocumentUpload() {
    const { user } = useAuth();
    const { identity, addIdentityDocument, removeIdentityDocument } = useOnboardingStore();
    const [uploadingType, setUploadingType] = useState(null);
    const [error, setError] = useState("");

    const getDocument = (documentType) =>
        identity.documents.find((d) => d.documentType === documentType) ?? null;

    const handleDrop = (documentType) => async (files) => {
        const file = files[0];
        if (!file) return;
        setError("");

        if (file.size > MAX_FILE_SIZE) {
            setError(`${file.name} is too large. Maximum size is 25MB.`);
            return;
        }
        const allowedMimeTypes = allowedMimeTypesFor(documentType);
        if (!allowedMimeTypes.includes(file.type)) {
            setError(
                PHOTO_ONLY_DOCUMENT_TYPES.includes(documentType)
                    ? `${file.name} must be a JPG or PNG photo. PDFs are not accepted for identity verification.`
                    : `${file.name} has invalid type. Only PDF, JPEG, and PNG are allowed.`
            );
            return;
        }
        if (!user) {
            setError("User not authenticated. Please log in again.");
            return;
        }

        setUploadingType(documentType);
        try {
            const result = await onboardingAPI.uploadDocument(file, "identity", documentType);
            addIdentityDocument({
                id: result.id,
                path: result.path,
                fileName: result.fileName,
                fileSize: result.fileSize,
                documentType: result.documentType,
                mimeType: result.mimeType,
            });
        } catch (err) {
            setError(`Failed to upload ${file.name}. ${err.response?.data?.message ?? "Please try again."}`);
        } finally {
            setUploadingType(null);
        }
    };

    const handleRemove = (documentType) => async () => {
        setError("");
        const index = identity.documents.findIndex((d) => d.documentType === documentType);
        if (index === -1) return;

        const doc = identity.documents[index];
        if (doc.id) {
            try {
                await onboardingAPI.deleteDocument(doc.id);
            } catch {
                setError(`Could not delete ${doc.fileName} from storage. Please try again.`);
                return;
            }
        }
        removeIdentityDocument(index);
    };

    return { uploadingType, error, setError, getDocument, handleDrop, handleRemove };
}