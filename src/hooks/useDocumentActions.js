"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingAPI } from "@/services/onboarding.api";
import { logger } from "@/lib/logger";

/**
 * View and replace actions for license documents, shared by the therapist and
 * customer profile surfaces.
 *
 * Replacement targets one document at a time and is confirmation-gated:
 * `startReplace` arms a document and opens a confirmation dialog, `confirmReplace`
 * opens the file picker, and the change handler uploads against whichever id is
 * armed. The profile query is invalidated on success so the rebuilt document
 * list and any new `pendingReviewAt` arrive together.
 *
 * Defaults target the therapist API so existing therapist call sites need no
 * arguments.
 *
 * @param {Object} [options]
 * @param {(documentId: string, file: File) => Promise<any>} [options.replaceFn] - Upload a replacement.
 * @param {(documentId: string) => Promise<any>} [options.viewFn] - Resolve a signed URL.
 * @param {Array<string>} [options.invalidateKey] - Query key invalidated after a successful replace.
 * @returns {{
 *   fileInputRef: import('react').RefObject<HTMLInputElement>,
 *   viewingDocId: string|null,
 *   replacingDocId: string|null,
 *   pendingReplaceDocId: string|null,
 *   isConfirmOpen: boolean,
 *   error: string|null,
 *   handleViewDocument: (docId: string) => Promise<void>,
 *   startReplace: (docId: string) => void,
 *   confirmReplace: () => void,
 *   cancelReplace: () => void,
 *   handleReplaceFileChange: (event: Event) => Promise<void>,
 *   clearError: () => void,
 * }}
 */
export function useDocumentActions({
    replaceFn = (documentId, file) => onboardingAPI.replaceDocument(documentId, file),
    viewFn = (documentId) => onboardingAPI.getDocumentUrl(documentId),
    invalidateKey = ["therapist-profile"],
} = {}) {
    const [viewingDocId, setViewingDocId] = useState(null);
    const [replacingDocId, setReplacingDocId] = useState(null);
    const [pendingReplaceDocId, setPendingReplaceDocId] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const targetDocIdRef = useRef(null);
    const queryClient = useQueryClient();

    const replaceMutation = useMutation({
        mutationFn: ({ documentId, file }) => replaceFn(documentId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invalidateKey });
        },
        onError: (err) => {
            logger.error("Failed to replace document:", err);
            setError(err.response?.data?.message || err.message || "Failed to replace document.");
        },
        onSettled: () => {
            setReplacingDocId(null);
            targetDocIdRef.current = null;
        },
    });

    const handleViewDocument = async (docId) => {
        setViewingDocId(docId);
        try {
            const res = await viewFn(docId);
            const url = res?.data?.data?.signedUrl || res?.data?.signedUrl || res?.signedUrl;
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
        setPendingReplaceDocId(docId);
    };

    const confirmReplace = () => {
        targetDocIdRef.current = pendingReplaceDocId;
        setPendingReplaceDocId(null);
        fileInputRef.current?.click();
    };

    const cancelReplace = () => {
        setPendingReplaceDocId(null);
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
        pendingReplaceDocId,
        isConfirmOpen: pendingReplaceDocId !== null,
        error,
        handleViewDocument,
        startReplace,
        confirmReplace,
        cancelReplace,
        handleReplaceFileChange,
        clearError: () => setError(null),
    };
}
