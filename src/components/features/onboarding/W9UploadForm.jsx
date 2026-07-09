"use client";

import { DocumentDropzone } from "@/components/features/onboarding/DocumentDropzone";

const IRS_W9_URL = "https://www.irs.gov/pub/irs-pdf/fw9.pdf";

/**
 * W-9 sub-form — Compliance Forms sub-step 1 of 4. Download the official
 * IRS form, sign it offline, then upload the signed copy. No new content,
 * just the existing upload-dropzone pattern plus an outbound IRS link.
 *
 * @param {{
 *   document: { fileName: string } | null,
 *   uploading: boolean,
 *   error?: string,
 *   onDrop: (files: File[]) => void,
 *   onRemove: () => void,
 *   onContinue: () => void,
 *   onBack: () => void,
 * }} props
 */
export function W9UploadForm({ document, uploading, error, onDrop, onRemove, onContinue, onBack }) {
    return (
        <div className="bg-card-light border border-border-light rounded-xl p-8 space-y-6 shadow-sm">
            <p className="text-text-main text-base leading-relaxed">
                A W-9 form is required for tax purposes. Download the official form from the IRS, fill it out,
                sign it, then upload your signed copy below.
            </p>

            <a
                href={IRS_W9_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors"
            >
                Download W-9 from IRS
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </a>

            <DocumentDropzone
                label="Signed W-9 Form"
                required
                document={document}
                uploading={uploading}
                error={error}
                onDrop={onDrop}
                onRemove={onRemove}
            />

            <div className="flex items-center justify-between pt-6 border-t border-border-light">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors"
                >
                    Back
                </button>

                <button
                    type="button"
                    onClick={onContinue}
                    disabled={!document}
                    className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:brightness-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}