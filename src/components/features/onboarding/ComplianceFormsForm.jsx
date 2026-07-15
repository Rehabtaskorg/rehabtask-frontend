"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import { useComplianceForms } from "@/hooks/useComplianceForms";
import OnboardingProgressBar from "@/components/therapist/OnboardingProgressBar";
import { SubStepDots } from "@/components/features/onboarding/SubStepDots";
import { W9UploadForm } from "@/components/features/onboarding/W9UploadForm";
import { SignatureAgreementForm } from "@/components/features/onboarding/SignatureAgreementForm";

const SUB_STEP_LABELS = {
    w9: "W-9",
    independent_contractor_agreement: "Independent Contractor Agreement",
    hipaa_acknowledgment: "HIPAA Acknowledgment",
    background_check_authorization: "Background Check Authorization",
};

const SUMMARIES = {
    independent_contractor_agreement:
        "This agreement covers the terms of your engagement as an independent contractor with RehabTask, including compensation, confidentiality, and termination terms.",
    hipaa_acknowledgment:
        "This acknowledgment outlines your responsibility to protect patient privacy and confidential health information while providing services through RehabTask.",
    background_check_authorization:
        "This authorizes RehabTask to conduct a background screening through First Advantage as part of onboarding.",
};

/**
 * Compliance Forms onboarding step (Step 7) — 4 sub-forms shown one at a
 * time: W-9 upload, then 3 e-signature documents sharing one reusable
 * read+agree+sign component.
 *
 * Each signature sub-form is keyed by its document type so React fully
 * remounts it on every sub-step transition — this guarantees the checkbox,
 * scroll gate, and signature field always start blank for each new document,
 * preventing state bleed across compliance steps.
 */
export function ComplianceFormsForm() {
    usePageTitle("Compliance Forms");
    const {
        subStep,
        totalSubSteps,
        currentSubStepKey,
        completedSteps,
        content,
        initializing,
        loading,
        error,
        upload,
        onW9Continue,
        onSign,
        onBack,
    } = useComplianceForms();

    if (initializing) {
        return (
            <div className="min-h-screen bg-background-light py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <OnboardingProgressBar />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <OnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Compliance Forms
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal mb-4">
                        Please review and sign the required forms.
                    </p>
                    <p className="text-text-main text-sm font-semibold mb-4">
                        Form {subStep + 1} of {totalSubSteps} — {SUB_STEP_LABELS[currentSubStepKey]}
                    </p>
                    <SubStepDots current={subStep} total={totalSubSteps} completedSteps={completedSteps} />
                </header>

                {currentSubStepKey === "w9" ? (
                    <W9UploadForm
                        document={upload.getDocument("w9")}
                        uploading={upload.uploadingType === "w9"}
                        error={upload.error}
                        onDrop={upload.handleDrop("w9")}
                        onRemove={upload.handleRemove("w9")}
                        onContinue={onW9Continue}
                        onBack={onBack}
                    />
                ) : (
                    <SignatureAgreementForm
                        key={currentSubStepKey}
                        title={SUB_STEP_LABELS[currentSubStepKey]}
                        summary={SUMMARIES[currentSubStepKey]}
                        content={content?.[toContentKey(currentSubStepKey)] ?? ""}
                        loading={loading}
                        error={error}
                        onSubmit={(signature) => onSign(currentSubStepKey, signature)}
                        onBack={onBack}
                        submitLabel={subStep === totalSubSteps - 1 ? "Sign & Finish" : "Sign & Continue"}
                    />
                )}
            </div>
        </div>
    );
}

/** Maps a documentType key to the matching field name in getComplianceContent's response. */
const toContentKey = (documentType) => ({
    independent_contractor_agreement: "independentContractorAgreement",
    hipaa_acknowledgment: "hipaaAcknowledgment",
    background_check_authorization: "backgroundCheckAuthorization",
})[documentType];
