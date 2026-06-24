"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useAgencyActivation } from "@/hooks/useAgencyActivation";
import { AgencyOnboardingProgressBar } from "@/components/features/onboarding/agency/AgencyOnboardingProgressBar";

const CHECKLIST = [
    { label: "Business Profile", desc: "Agency details and billing contact" },
    { label: "Required Documents", desc: "License and insurance certificates uploaded" },
    { label: "Compliance Forms", desc: "W-9, Service Agreement, and HIPAA BAA signed" },
];

/**
 * Agency onboarding Step 5 — Activation.
 * Read-only checklist + submit button. Calls completeAgencyOnboarding on submit.
 */
export function AgencyActivationScreen() {
    usePageTitle("Submit for Activation");
    const { submitting, error, onSubmit, onBack } = useAgencyActivation();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <AgencyOnboardingProgressBar />
                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Submit for Activation
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Review your completed steps and submit your agency for approval.
                    </p>
                </header>

                <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                    <div className="p-8 space-y-6">
                        <p className="text-text-main text-base font-semibold">Completed steps</p>

                        <ul className="space-y-3">
                            {CHECKLIST.map(({ label, desc }) => (
                                <li key={label} className="flex items-start gap-4 p-4 rounded-lg bg-green-50 border border-green-100">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <div>
                                        <p className="text-text-main font-semibold text-sm">{label}</p>
                                        <p className="text-text-muted text-sm">{desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="bg-green-50 px-6 py-4 rounded-lg flex items-start gap-3 border border-green-100">
                            <svg className="h-5 w-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path clipRule="evenodd" fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                            <p className="text-sm text-green-700">
                                Submitting will activate your agency account immediately. You will have full access to the platform right away.
                            </p>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>

                    <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={submitting}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={submitting}
                            className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Activating…" : (
                                <>
                                    Submit for Activation
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
