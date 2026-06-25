"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IndividualOnboardingProgressBar } from "@/components/features/onboarding/individual/IndividualOnboardingProgressBar";
import { SubStepDots } from "@/components/features/onboarding/SubStepDots";

const SUB_STEPS = ["hipaa_consent", "treatment_consent"];

const SUB_STEP_LABELS = {
    hipaa_consent: "HIPAA Consent",
    treatment_consent: "Treatment Consent",
};

const SUMMARIES = {
    hipaa_consent:
        "This form authorizes RehabTask to use and disclose your protected health information for treatment, payment, and healthcare operations in accordance with HIPAA regulations.",
    treatment_consent:
        "This form documents your informed consent to receive physical therapy and related rehabilitation services provided through the RehabTask platform.",
};

function RepresentativeFields() {
    return (
        <div className="space-y-4 pt-4 border-t border-border-light">
            <p className="text-text-main text-sm font-semibold">Personal / Legal Representative</p>

            <div className="flex flex-col gap-2">
                <label htmlFor="representativeName" className="text-text-main text-sm font-semibold">
                    Representative Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    id="representativeName"
                    type="text"
                    placeholder="e.g. Jane Doe"
                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="representativeRelationship" className="text-text-main text-sm font-semibold">
                    Relationship to Patient <span className="text-red-500">*</span>
                </label>
                <input
                    id="representativeRelationship"
                    type="text"
                    placeholder="e.g. Parent, Spouse, Guardian"
                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="representativeAuthority" className="text-text-main text-sm font-semibold">
                    Legal Authority <span className="text-red-500">*</span>
                </label>
                <input
                    id="representativeAuthority"
                    type="text"
                    placeholder="e.g. Power of Attorney, Parent, Guardian"
                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
            </div>
        </div>
    );
}

function ConsentSubForm({ subStepKey, onBack, onContinue, isLast }) {
    const [isRepresentative, setIsRepresentative] = useState(false);

    return (
        <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
            <div className="p-8 space-y-6">
                <p className="text-text-main text-base leading-relaxed">{SUMMARIES[subStepKey]}</p>

                <button
                    type="button"
                    className="flex items-center gap-2 px-5 py-3 rounded-lg border border-border-light text-text-main font-semibold hover:bg-muted-light transition-colors"
                >
                    Read Full Document
                </button>

                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-text-muted cursor-not-allowed">
                        <input
                            type="checkbox"
                            disabled
                            className="w-4 h-4 rounded border-border-light accent-primary disabled:cursor-not-allowed"
                        />
                        I have read and agree to the terms above
                    </label>
                    <p className="text-xs text-text-muted">Please read the full document to continue</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor={`signature-${subStepKey}`} className="text-text-main text-sm font-semibold">
                        Type your full legal name to sign
                    </label>
                    <input
                        id={`signature-${subStepKey}`}
                        type="text"
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    />
                    <p className="text-xs text-text-muted">This serves as your electronic signature</p>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={isRepresentative}
                            onChange={(e) => setIsRepresentative(e.target.checked)}
                            className="w-4 h-4 rounded border-border-light accent-primary"
                        />
                        <span className="text-sm text-text-main font-semibold">
                            I am signing on behalf of another person
                        </span>
                    </label>
                </div>

                {isRepresentative && <RepresentativeFields />}
            </div>

            <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                <button
                    type="button"
                    onClick={onBack}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
                <button
                    type="button"
                    onClick={onContinue}
                    className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2"
                >
                    {isLast ? "Sign & Finish" : "Sign & Continue"}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export function IndividualConsentFormsForm() {
    usePageTitle("Consent Forms");
    const router = useRouter();
    const [subStepIndex, setSubStepIndex] = useState(0);

    const currentKey = SUB_STEPS[subStepIndex];
    const isLast = subStepIndex === SUB_STEPS.length - 1;

    const handleBack = () => {
        if (subStepIndex > 0) {
            setSubStepIndex((i) => i - 1);
        } else {
            router.push("/customer/onboarding/individual/medical-info");
        }
    };

    const handleContinue = () => {
        if (!isLast) {
            setSubStepIndex((i) => i + 1);
        } else {
            router.push("/customer/onboarding/individual/activation");
        }
    };

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <IndividualOnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Consent Forms
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal mb-4">
                        Please review and sign the required consent documents.
                    </p>
                    <p className="text-text-main text-sm font-semibold mb-2">
                        Form {subStepIndex + 1} of {SUB_STEPS.length} — {SUB_STEP_LABELS[currentKey]}
                    </p>
                    <SubStepDots current={subStepIndex} total={SUB_STEPS.length} />
                </header>

                <ConsentSubForm
                    key={currentKey}
                    subStepKey={currentKey}
                    onBack={handleBack}
                    onContinue={handleContinue}
                    isLast={isLast}
                />
            </div>
        </div>
    );
}