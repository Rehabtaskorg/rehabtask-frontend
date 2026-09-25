"use client";

import { useState } from "react";
import { DocumentDropzone } from "@/components/features/onboarding/DocumentDropzone";
import { formatShortDate } from "@/utils/dates";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";

/**
 * One document slot on the application review screen. Shows the currently
 * stored file and swaps to a dropzone once the customer clicks Replace.
 *
 * @param {{
 *   label: string,
 *   documentType: string,
 *   isRequired?: boolean,
 *   document: { fileName: string, uploadedAt?: string }|null,
 *   uploadFn: (file: File, documentType: string) => Promise<any>,
 *   onReplaced: (documentType: string) => void,
 * }} props
 */
export function ApplicationDocumentSlot({
    label,
    documentType,
    isRequired = false,
    document,
    uploadFn,
    onReplaced,
}) {
    const [isReplacing, setIsReplacing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [replacement, setReplacement] = useState(null);

    const handleDrop = async (files) => {
        const file = files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploaded = await uploadFn(file, documentType);
            setReplacement(uploaded);
            onReplaced(documentType);
            showToast.success(`${label} updated`);
        } catch (error) {
            logger.error("[ApplicationDocumentSlot] upload failed", error);
            showToast.error(error?.response?.data?.message ?? "Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleStartReplace = () => setIsReplacing(true);
    const handleRemoveReplacement = () => setReplacement(null);

    return (
        <div className="border border-border-light rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-text-main font-semibold text-sm">{label}</span>
                <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${isRequired ? "bg-primary text-white" : "bg-gray-100 text-text-muted"}`}
                >
                    {isRequired ? "REQUIRED" : "OPTIONAL"}
                </span>
            </div>

            {isReplacing ? (
                <DocumentDropzone
                    label=""
                    document={replacement}
                    uploading={isUploading}
                    onDrop={handleDrop}
                    onRemove={handleRemoveReplacement}
                />
            ) : (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                        <p className="text-sm text-text-main truncate">{document?.fileName ?? "No file uploaded"}</p>
                        {document?.uploadedAt && (
                            <p className="text-xs text-text-muted">Uploaded {formatShortDate(document.uploadedAt)}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleStartReplace}
                        className="text-sm font-semibold text-primary underline hover:no-underline shrink-0"
                    >
                        {document ? "Replace" : "Upload"}
                    </button>
                </div>
            )}
        </div>
    );
}