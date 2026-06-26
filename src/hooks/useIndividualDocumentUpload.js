"use client";

import { useState } from "react";
import useIndividualOnboardingStore from "@/store/individualOnboardingStore";
import { individualOnboardingAPI } from "@/lib/individual.onboarding.api";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

/**
 * Upload/remove logic for the individual therapy order document slot.
 * Upload fires immediately on drop — not deferred to submit.
 */
export function useIndividualDocumentUpload() {
    const therapyOrderDocument = useIndividualOnboardingStore((s) => s.therapyOrderDocument);
    const setTherapyOrderDocument = useIndividualOnboardingStore((s) => s.setTherapyOrderDocument);

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleDrop = async (files) => {
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

        setUploading(true);
        try {
            const result = await individualOnboardingAPI.uploadDocument(file, "therapy_order");
            setTherapyOrderDocument({
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
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setError("");
        if (!therapyOrderDocument) return;
        if (therapyOrderDocument.id) {
            try {
                await individualOnboardingAPI.deleteDocument(therapyOrderDocument.id);
            } catch {
                setError("Could not delete the document from storage. Please try again.");
                return;
            }
        }
        setTherapyOrderDocument(null);
    };

    return { therapyOrderDocument, uploading, error, setError, handleDrop, handleRemove };
}