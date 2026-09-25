"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";

/**
 * Shared resubmission state for the customer application review page.
 * Owns the note field, the replaced-document tracker, the confirm modal,
 * and the resubmit mutation. Callers supply the customer-type specific
 * API function.
 *
 * @param {{ resubmitFn: (note: string|null) => Promise<any> }} opts
 */
export function useApplicationResubmission({ resubmitFn }) {
    const [replacedTypes, setReplacedTypes] = useState([]);
    const [note, setNote] = useState("");
    const [isNoteVisible, setIsNoteVisible] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const trimmedNote = note.trim();
    const isDirty = replacedTypes.length > 0 || trimmedNote.length > 0;

    const markReplaced = (documentType) => {
        setReplacedTypes((prev) => (prev.includes(documentType) ? prev : [...prev, documentType]));
    };

    const mutation = useMutation({
        mutationFn: () => resubmitFn(trimmedNote.length > 0 ? trimmedNote : null),
        onSuccess: () => {
            window.location.href = "/customer/pending-approval";
        },
        onError: (error) => {
            logger.error("[useApplicationResubmission] resubmit failed", error);
            showToast.error(
                error?.response?.data?.message ?? "We couldn't resubmit your application. Please try again."
            );
        },
        onSettled: () => {
            setIsConfirmOpen(false);
        },
    });

    const handleOpenConfirm = () => setIsConfirmOpen(true);
    const handleCloseConfirm = () => {
        if (!mutation.isPending) setIsConfirmOpen(false);
    };
    const handleConfirm = () => mutation.mutate();
    const handleToggleNote = () => setIsNoteVisible((prev) => !prev);
    const handleNoteChange = (event) => setNote(event.target.value.slice(0, 500));

    return {
        note,
        isNoteVisible,
        isConfirmOpen,
        isDirty,
        isSubmitting: mutation.isPending,
        markReplaced,
        handleOpenConfirm,
        handleCloseConfirm,
        handleConfirm,
        handleToggleNote,
        handleNoteChange,
    };
}