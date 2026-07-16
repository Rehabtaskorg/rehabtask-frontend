'use client';

import { useUnifiedAgreement } from '@/hooks/useUnifiedAgreement';

/**
 * Full-screen overlay modal that presents the unified legal agreement.
 * Blocks all dashboard interaction until the user accepts or declines.
 * The agree checkbox is gated behind scrolling to the bottom of the document.
 * Declining logs the user out and redirects to /login.
 *
 * @param {{ onAccepted: () => void, onDecline: () => void }} props
 */
export function UnifiedAgreementModal({ onAccepted, onDecline }) {
    const {
        sections,
        hasScrolledToBottom,
        accepted,
        loading,
        accepting,
        error,
        setAccepted,
        handleAccept,
        handleDecline,
        handleScroll,
    } = useUnifiedAgreement({ onAccepted, onDecline });

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agreement-title"
        >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <div className="px-8 pt-8 pb-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <h1 id="agreement-title" className="text-xl font-bold text-slate-900 dark:text-white">
                        RehabTask Unified Legal Agreement
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Please read the entire agreement before accepting.
                    </p>
                </div>

                <div
                    className="flex-1 overflow-y-auto px-8 py-6 space-y-8"
                    onScroll={handleScroll}
                >
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        </div>
                    )}

                    {!loading && error && (
                        <p className="text-red-600 dark:text-red-400 text-sm text-center py-10">{error}</p>
                    )}

                    {!loading && !error && sections.map((section) => (
                        <div key={section.sectionNumber}>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                                {section.sectionNumber}. {section.title}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {section.body}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-700 shrink-0 space-y-4">
                    {!hasScrolledToBottom && !loading && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                            Scroll to the bottom to enable the agreement checkbox.
                        </p>
                    )}

                    <label className={`flex items-start gap-3 cursor-pointer select-none ${!hasScrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}>
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            disabled={!hasScrolledToBottom}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary shrink-0"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                            I have read and agree to the entire RehabTask Unified Legal Agreement, including all sections applicable to my account type.
                        </span>
                    </label>

                    {error && !loading && (
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    )}

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={handleDecline}
                            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            type="button"
                            onClick={handleAccept}
                            disabled={!accepted || accepting}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {accepting && (
                                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin shrink-0" />
                            )}
                            Accept &amp; Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
