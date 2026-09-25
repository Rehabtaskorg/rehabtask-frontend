"use client";

import { useState } from "react";
import { MdLock, MdWarning } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentReaderModal } from "@/components/features/onboarding/DocumentReaderModal";

/**
 * Confirmation modal shown before the signature is submitted.
 * Gives the user one final chance to catch a typo before the
 * e-signature is persisted on the backend.
 */
function SignatureConfirmModal({ isOpen, signature, onConfirm, onCancel, loading }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        className="relative bg-card-light rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <MdWarning className="text-amber-600 text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-text-main">Confirm your signature</h3>
                                    <p className="text-sm text-text-muted mt-1">
                                        Once submitted, this signature cannot be changed. Please verify your legal name is correct.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-muted-light border border-border-light rounded-lg px-4 py-3">
                                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-1">Signing as</p>
                                <p className="text-lg font-semibold text-text-main font-mono">{signature}</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors disabled:opacity-50"
                                >
                                    Go Back & Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-bold hover:brightness-95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Saving..." : "Confirm & Sign"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Shared read-summary, open-full-document, agree-checkbox, and
 * typed-signature pattern used by all 3 e-signature Compliance Forms
 * sub-forms (Independent Contractor Agreement, HIPAA Acknowledgment,
 * Background Check Authorization). The agreement checkbox stays disabled
 * until the reader has scrolled the full document to the bottom at least
 * once, so checking it requires having actually seen the whole thing.
 * A confirmation modal fires before final submission so the user can
 * catch a typo in their legal name before it is persisted.
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
 *   skipScrollGate?: boolean,
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
    skipScrollGate = false,
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [hasReadToBottom, setHasReadToBottom] = useState(skipScrollGate);
    const [agreed, setAgreed] = useState(false);
    const [signature, setSignature] = useState("");

    const canSubmit = agreed && signature.trim().length > 1 && !loading;

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        onSubmit(signature.trim());
        setConfirmOpen(false);
    };

    return (
        <>
            <form onSubmit={handleFormSubmit}>
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
                            {submitLabel}
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

            <SignatureConfirmModal
                isOpen={confirmOpen}
                signature={signature.trim()}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmOpen(false)}
                loading={loading}
            />
        </>
    );
}
