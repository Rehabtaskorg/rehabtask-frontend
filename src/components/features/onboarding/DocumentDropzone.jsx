"use client";

import { useDropzone } from "react-dropzone";

const ACCEPTED_TYPES = {
    "application/pdf": [".pdf"],
    "image/*": [".jpeg", ".jpg", ".png"],
};

/**
 * Single-document upload dropzone with an uploaded-file row beneath it.
 * Stateless — the parent owns the uploaded document and passes it in.
 *
 * @param {{
 *   label: string,
 *   required?: boolean,
 *   helperText?: string,
 *   document?: { fileName: string } | null,
 *   uploading?: boolean,
 *   disabled?: boolean,
 *   error?: string,
 *   onDrop: (files: File[]) => void,
 *   onRemove: () => void,
 * }} props
 */
export function DocumentDropzone({
    label,
    required = false,
    helperText,
    document,
    uploading = false,
    disabled = false,
    error,
    onDrop,
    onRemove,
}) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: ACCEPTED_TYPES,
        multiple: false,
        maxFiles: 1,
        disabled: disabled || uploading || !!document,
    });

    return (
        <div className="flex flex-col gap-2">
            <label className="text-text-main text-sm font-semibold">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {helperText && <p className="text-xs text-text-muted">{helperText}</p>}

            {document ? (
                <div className="flex items-center justify-between bg-muted-light p-3 rounded-lg border border-border-light">
                    <div className="flex items-center gap-3 min-w-0">
                        <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-text-main text-sm truncate">{document.fileName}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-500 hover:text-red-600 font-semibold text-sm shrink-0 ml-4"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed border-border-light rounded-xl p-8 flex flex-col items-center justify-center bg-muted-light transition-colors ${
                        disabled || uploading
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-primary/5 hover:border-primary cursor-pointer group"
                    }`}
                >
                    <input {...getInputProps()} />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                            <p className="text-text-main text-sm font-medium">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <p className="text-text-main text-sm font-medium text-center">
                                {isDragActive ? "Drop file here..." : "Click to upload or drag and drop"}
                            </p>
                            <p className="text-text-muted text-xs mt-1 text-center">
                                PDF, JPG or PNG (max. 25MB)
                            </p>
                        </>
                    )}
                </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
