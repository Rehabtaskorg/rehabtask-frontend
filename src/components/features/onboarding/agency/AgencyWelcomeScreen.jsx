"use client";

import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AgencyOnboardingProgressBar } from "@/components/features/onboarding/agency/AgencyOnboardingProgressBar";

/**
 * Agency onboarding Step 1 — Welcome.
 * Static screen. No form, no API call.
 */
export function AgencyWelcomeScreen() {
    usePageTitle("Welcome");
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">

                <AgencyOnboardingProgressBar />
            <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Welcome to RehabTask
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Let&apos;s get your agency set up. This should take about 10 minutes.
                    </p>
                </header>

                <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                    <div className="p-8 space-y-6">
                        <p className="text-text-main text-base leading-relaxed">
                            To apply for access you&apos;ll complete the following steps:
                        </p>

                        <ol className="space-y-4">
                            {[
                                { step: 1, label: "Business Profile", desc: "Agency details, address, and billing contact" },
                                { step: 2, label: "Upload Documents", desc: "State license and insurance certificates" },
                                { step: 3, label: "Compliance Forms", desc: "W-9, Service Agreement, and HIPAA BAA e-signatures" },
                                { step: 4, label: "Submit Application", desc: "Review and submit your application for approval" },
                            ].map(({ step, label, desc }) => (
                                <li key={step} className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                                        {step}
                                    </span>
                                    <div>
                                        <p className="text-text-main font-semibold">{label}</p>
                                        <p className="text-text-muted text-sm">{desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>

                        <div className="bg-amber-50 px-6 py-4 rounded-lg flex items-start gap-3 border border-amber-100">
                            <svg className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <p className="text-sm text-amber-800">
                                After submitting, our team will review your application within <strong>2–5 business days</strong> and notify you by email.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 bg-muted-light flex justify-end border-t border-border-light">
                        <button
                            type="button"
                            onClick={() => router.push("/customer/onboarding/agency/business-profile")}
                            className="px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center gap-2"
                        >
                            Get Started
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
