"use client";

import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";

const CHECKLIST = [
    { label: "Business Profile", desc: "Agency details and billing contact" },
    { label: "Required Documents", desc: "License and insurance certificates uploaded" },
    { label: "Compliance Forms", desc: "W-9, Service Agreement, and HIPAA BAA signed" },
];

/**
 * Agency onboarding Step 5 — Activation.
 * Skeleton: read-only checklist + submit button. No API call in skeleton mode.
 */
export function AgencyActivationScreen() {
    usePageTitle("Submit for Activation");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
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

                        <div className="bg-blue-50 px-6 py-4 rounded-lg flex items-start gap-3 border border-blue-100">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path clipRule="evenodd" fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                            </svg>
                            <p className="text-sm text-blue-700">
                                Our team will review your submission within 1–2 business days. You will receive an email once your agency is approved.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                        <button
                            type="button"
                            onClick={() => router.push("/customer/onboarding/agency/compliance")}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/customer/dashboard")}
                            className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2"
                        >
                            Submit for Activation
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
