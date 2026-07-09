"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useAgencyComplianceForm } from "@/hooks/useAgencyComplianceForm";
import { W9UploadForm } from "@/components/features/onboarding/W9UploadForm";
import { SignatureAgreementForm } from "@/components/features/onboarding/SignatureAgreementForm";
import { SubStepDots } from "@/components/features/onboarding/SubStepDots";
import { AgencyOnboardingProgressBar } from "@/components/features/onboarding/agency/AgencyOnboardingProgressBar";

const SUB_STEP_LABELS = {
    w9: "Business W-9",
    service_agreement: "Service Agreement",
    hipaa_baa: "HIPAA Business Associate Agreement",
};

const SUMMARIES = {
    service_agreement:
        "This agreement covers the terms of your agency's engagement with RehabTask, including platform usage, service standards, and payment terms.",
    hipaa_baa:
        "This Business Associate Agreement establishes the responsibilities of both parties to protect patient health information in accordance with HIPAA regulations.",
};

/**
 * Agency onboarding Step 4 — Compliance Forms.
 * Three sub-forms: W-9 upload, Service Agreement e-sign, HIPAA BAA e-sign.
 */
export function AgencyComplianceFormsForm() {
    usePageTitle("Compliance Forms");
    const {
        subStepIndex,
        totalSubSteps,
        currentKey,
        content,
        loading,
        error,
        w9Document,
        w9Uploading,
        w9Error,
        onW9Drop,
        onW9Remove,
        handleW9Continue,
        handleSign,
        handleBack,
    } = useAgencyComplianceForm();

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <AgencyOnboardingProgressBar />
                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Compliance Forms
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal mb-4">
                        Please review and sign the required compliance documents.
                    </p>
                    <p className="text-text-main text-sm font-semibold mb-2">
                        Form {subStepIndex + 1} of {totalSubSteps} — {SUB_STEP_LABELS[currentKey]}
                    </p>
                    <SubStepDots current={subStepIndex} total={totalSubSteps} />
                </header>

                {error && <p className="text-red-500 text-sm px-4 mb-4">{error}</p>}

                {currentKey === "w9" ? (
                    <W9UploadForm
                        document={w9Document}
                        uploading={w9Uploading}
                        error={w9Error}
                        onDrop={onW9Drop}
                        onRemove={onW9Remove}
                        onContinue={handleW9Continue}
                        onBack={handleBack}
                    />
                ) : (
                    <SignatureAgreementForm
                        title={SUB_STEP_LABELS[currentKey]}
                        summary={SUMMARIES[currentKey]}
                        content={content[currentKey] ?? "Loading document…"}
                        loading={loading}
                        error={null}
                        onSubmit={handleSign}
                        onBack={handleBack}
                        submitLabel={subStepIndex === totalSubSteps - 1 ? "Sign & Finish" : "Sign & Continue"}
                    />
                )}
            </div>
        </div>
    );
}
