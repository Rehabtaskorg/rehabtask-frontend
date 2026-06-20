"use client";

import { useState } from "react";
import { MdLock } from "react-icons/md";
import { DocumentReaderModal } from "@/components/features/onboarding/DocumentReaderModal";

/**
 * Shared read-summary, open-full-document, agree-checkbox, and
 * typed-signature pattern used by all 3 e-signature Compliance Forms
 * sub-forms (Independent Contractor Agreement, HIPAA Acknowledgment,
 * Background Check Authorization). The agreement checkbox stays disabled
 * until the reader has scrolled the full document to the bottom at least
 * once, so checking it requires having actually seen the whole thing.
 *
 * @param {{
 *   title: string,
 *   summary: string,
 *   content: string,
 *   loading: boolean,
 *   error?: string,
 *   onSubmit: (signature: string) => void,
 *   onBack: () => void,
 *   submitLabel?: string,
 * }} props
 */
export function SignatureAgreementForm({
    title,
    summary,
    content,
    loading,
    error,
    onSubmit,
    onBack,
    submitLabel = "Sign & Continue",
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [hasReadToBottom, setHasReadToBottom] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [signature, setSignature] = useState("");

    const canSubmit = agreed && signature.trim().length > 1 && !loading;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit(signature.trim());
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-card-light border border-border-light rounded-xl p-8 space-y-6 shadow-sm">
                <p className="text-text-main text-base leading-relaxed">{summary}</p>

                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors"
                >
                    Read Full Document
                </button>

                <div className="flex flex-col gap-2">
                    <label className={`flex items-center gap-2 text-sm font-semibold ${hasReadToBottom ? "text-text-main cursor-pointer" : "text-text-muted cursor-not-allowed"}`}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            disabled={!hasReadToBottom}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="w-4 h-4 rounded border-border-light accent-primary disabled:cursor-not-allowed"
                        />
                        I have read and agree to the terms above
                        {!hasReadToBottom && <MdLock className="text-sm" />}
                    </label>
                    {!hasReadToBottom && (
                        <p className="text-xs text-text-muted">Please read the full document to continue</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-text-main text-sm font-semibold" htmlFor="signature">
                        Type your full legal name to sign
                    </label>
                    <input
                        id="signature"
                        type="text"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    />
                    <p className="text-xs text-text-muted">This serves as your electronic signature</p>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex items-center justify-between pt-6 border-t border-border-light">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors"
                    >
                        Back
                    </button>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:brightness-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : submitLabel}
                    </button>
                </div>
            </div>

            <DocumentReaderModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={title}
                content={content}
                onScrolledToBottom={() => setHasReadToBottom(true)}
            />
        </form>
    );
}