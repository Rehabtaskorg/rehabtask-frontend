"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingAPI } from "@/services/onboarding.api";
import { logger } from "@/lib/logger";

/**
 * View and replace actions for therapist license documents.
 *
 * Replacement targets one document at a time: `startReplace` stores the target
 * id and opens the shared file picker, and the change handler uploads against
 * whichever id is armed. The therapist profile query is invalidated on success
 * so the rebuilt document list and any new `pendingReviewAt` arrive together.
 *
 * @returns {{
 *   fileInputRef: import('react').RefObject<HTMLInputElement>,
 *   viewingDocId: string|null,
 *   replacingDocId: string|null,
 *   error: string|null,
 *   handleViewDocument: (docId: string) => Promise<void>,
 *   startReplace: (docId: string) => void,
 *   handleReplaceFileChange: (event: Event) => Promise<void>,
 *   clearError: () => void,
 * }}
 */
export function useDocumentActions() {
    const [viewingDocId, setViewingDocId] = useState(null);
    const [replacingDocId, setReplacingDocId] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const targetDocIdRef = useRef(null);
    const queryClient = useQueryClient();

    const replaceMutation = useMutation({
        mutationFn: ({ documentId, file }) => onboardingAPI.replaceDocument(documentId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["therapist-profile"] });
        },
        onError: (err) => {
            logger.error("Failed to replace document:", err);
            setError(err.response?.data?.message || "Failed to replace document.");
        },
        onSettled: () => {
            setReplacingDocId(null);
            targetDocIdRef.current = null;
        },
    });

    const handleViewDocument = async (docId) => {
        setViewingDocId(docId);
        try {
            const res = await onboardingAPI.getDocumentUrl(docId);
            const url = res.data?.data?.signedUrl || res.data?.signedUrl;
            if (url) {
                window.open(url, "_blank");
            }
        } catch (err) {
            logger.error("Error fetching document URL:", err);
            setError("Could not open that document. Please try again.");
        } finally {
            setViewingDocId(null);
        }
    };

    const startReplace = (docId) => {
        setError(null);
        targetDocIdRef.current = docId;
        fileInputRef.current?.click();
    };

    const handleReplaceFileChange = async (event) => {
        const file = event.target.files?.[0];
        const documentId = targetDocIdRef.current;
        event.target.value = "";
        if (!file || !documentId) return;

        setReplacingDocId(documentId);
        try {
            await replaceMutation.mutateAsync({ documentId, file });
        } catch {
            // Surfaced through the mutation's onError handler.
        }
    };

    return {
        fileInputRef,
        viewingDocId,
        replacingDocId,
        error,
        handleViewDocument,
        startReplace,
        handleReplaceFileChange,
        clearError: () => setError(null),
    };
}
