"use client";

import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { IndividualOnboardingProgressBar } from "@/components/features/onboarding/individual/IndividualOnboardingProgressBar";
import { SignatureAgreementForm } from "@/components/features/onboarding/SignatureAgreementForm";
import { SubStepDots } from "@/components/features/onboarding/SubStepDots";
import { useIndividualConsentForm } from "@/hooks/useIndividualConsentForm";

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

/**
 * Representative fields shown when the user checks "signing on behalf".
 * All three fields are required if any are filled — enforced by Zod on the backend.
 *
 * @param {{ representativeName: string, representativeRelationship: string, representativeAuthority: string, onChange: Function }} props
 */
function RepresentativeFields({ representativeName, representativeRelationship, representativeAuthority, onChange }) {
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
                    value={representativeName}
                    onChange={(e) => onChange("representativeName", e.target.value)}
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
                    value={representativeRelationship}
                    onChange={(e) => onChange("representativeRelationship", e.target.value)}
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
                    value={representativeAuthority}
                    onChange={(e) => onChange("representativeAuthority", e.target.value)}
                    placeholder="e.g. Power of Attorney, Parent, Guardian"
                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
            </div>
        </div>
    );
}

/**
 * Wraps SignatureAgreementForm with the representative block for one consent sub-step.
 *
 * @param {{ subStepKey: string, content: string, loading: boolean, error: string, onSign: Function, onBack: Function, isLast: boolean }} props
 */
function ConsentSubStep({ subStepKey, content, loading, error, onSign, onBack, isLast }) {
    const [isRepresentative, setIsRepresentative] = useState(false);
    const [repFields, setRepFields] = useState({
        representativeName: "",
        representativeRelationship: "",
        representativeAuthority: "",
    });

    const handleRepFieldChange = (field, value) => {
        setRepFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleSign = (signature) => {
        const representativeFields = isRepresentative
            ? {
                representativeName: repFields.representativeName || null,
                representativeRelationship: repFields.representativeRelationship || null,
                representativeAuthority: repFields.representativeAuthority || null,
            }
            : {
                representativeName: null,
                representativeRelationship: null,
                representativeAuthority: null,
            };
        onSign(signature, representativeFields);
    };

    return (
        <div className="space-y-4">
            <SignatureAgreementForm
                title={SUB_STEP_LABELS[subStepKey]}
                summary={SUMMARIES[subStepKey]}
                content={content ?? "Loading document…"}
                loading={loading}
                error={error}
                onSubmit={handleSign}
                onBack={onBack}
                submitLabel={isLast ? "Sign & Finish" : "Sign & Continue"}
            />

            <div className="bg-card-light border border-border-light rounded-xl px-8 py-6 shadow-sm">
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

                {isRepresentative && (
                    <RepresentativeFields
                        representativeName={repFields.representativeName}
                        representativeRelationship={repFields.representativeRelationship}
                        representativeAuthority={repFields.representativeAuthority}
                        onChange={handleRepFieldChange}
                    />
                )}
            </div>
        </div>
    );
}

/**
 * Individual onboarding Step 4 — Consent Forms.
 * Two sub-forms: HIPAA Consent e-sign, Treatment Consent e-sign.
 */
export function IndividualConsentFormsForm() {
    usePageTitle("Consent Forms");
    const {
        subStepIndex,
        totalSubSteps,
        currentKey,
        content,
        loading,
        error,
        handleSign,
        handleBack,
    } = useIndividualConsentForm();

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
                        Form {subStepIndex + 1} of {totalSubSteps} — {SUB_STEP_LABELS[currentKey]}
                    </p>
                    <SubStepDots current={subStepIndex} total={totalSubSteps} />
                </header>

                <ConsentSubStep
                    key={currentKey}
                    subStepKey={currentKey}
                    content={content[currentKey]}
                    loading={loading}
                    error={error}
                    onSign={handleSign}
                    onBack={handleBack}
                    isLast={subStepIndex === totalSubSteps - 1}
                />
            </div>
        </div>
    );
}