"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/hooks/usePageTitle";
import { W9UploadForm } from "@/components/features/onboarding/W9UploadForm";
import { SignatureAgreementForm } from "@/components/features/onboarding/SignatureAgreementForm";
import { SubStepDots } from "@/components/features/onboarding/SubStepDots";

const SUB_STEPS = ["w9", "service_agreement", "hipaa_baa"];

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

const PLACEHOLDER_CONTENT = {
    service_agreement: "Service Agreement placeholder text. Full legal content pending from stakeholders.",
    hipaa_baa: "HIPAA BAA placeholder text. Full legal content pending from stakeholders.",
};

/**
 * Agency onboarding Step 4 — Compliance Forms.
 * Skeleton: 3 sub-forms (W-9 upload, Service Agreement, HIPAA BAA).
 * Reuses therapist compliance components — no API calls in skeleton mode.
 */
export function AgencyComplianceFormsForm() {
    usePageTitle("Compliance Forms");
    const router = useRouter();

    const [subStepIndex, setSubStepIndex] = useState(0);
    const [w9File, setW9File] = useState(null);

    const currentKey = SUB_STEPS[subStepIndex];
    const totalSubSteps = SUB_STEPS.length;

    const handleBack = () => {
        if (subStepIndex === 0) {
            router.push("/customer/onboarding/agency/upload-documents");
        } else {
            setSubStepIndex((i) => i - 1);
        }
    };

    const handleW9Continue = () => setSubStepIndex(1);

    const handleSign = () => {
        if (subStepIndex < totalSubSteps - 1) {
            setSubStepIndex((i) => i + 1);
        } else {
            router.push("/customer/onboarding/agency/payment");
        }
    };

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
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

                {currentKey === "w9" ? (
                    <W9UploadForm
                        document={w9File}
                        uploading={false}
                        error={null}
                        onDrop={(files) => files.length && setW9File({ fileName: files[0].name })}
                        onRemove={() => setW9File(null)}
                        onContinue={handleW9Continue}
                        onBack={handleBack}
                    />
                ) : (
                    <SignatureAgreementForm
                        title={SUB_STEP_LABELS[currentKey]}
                        summary={SUMMARIES[currentKey]}
                        content={PLACEHOLDER_CONTENT[currentKey]}
                        loading={false}
                        error={null}
                        onSubmit={handleSign}
                        onBack={handleBack}
                        submitLabel={subStepIndex === totalSubSteps - 1 ? "Sign & Finish" : "Sign & Continue"}
                        skipScrollGate
                    />
                )}
            </div>
        </div>
    );
}
