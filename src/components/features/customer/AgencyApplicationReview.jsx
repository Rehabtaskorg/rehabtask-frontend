"use client";

import { useQuery } from "@tanstack/react-query";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { agencyOnboardingAPI } from "@/services/onboarding.agency.api";
import { APPROVAL_STATUS } from "@/lib/constants";
import { useApplicationResubmission } from "@/hooks/useApplicationResubmission";
import { ReviewerFeedbackCard } from "@/components/features/customer/ReviewerFeedbackCard";
import { ApplicationDocumentSlot } from "@/components/features/customer/ApplicationDocumentSlot";
import { ResubmitApplicationFooter } from "@/components/features/customer/ResubmitApplicationFooter";

const AGENCY_DOCUMENT_SLOTS = [
    { key: "home_health_license", label: "State Home Health License", required: true },
    { key: "medicare_medicaid_cert", label: "Medicare / Medicaid Certification", required: false },
    { key: "general_liability", label: "General Liability Insurance", required: true },
    { key: "professional_liability", label: "Professional Liability Insurance", required: true },
    { key: "w9", label: "W-9 Tax Form", required: false },
];

const AGENCY_REVIEW_KEYS = { data: ["agency-onboarding", "data"] };

/**
 * Agency-facing application review screen. Lets a rejected agency replace
 * documents and push the application back into review.
 */
export function AgencyApplicationReview() {
    const customer = useCustomerUser();
    const isRejected = customer?.approvalStatus === APPROVAL_STATUS.REJECTED;

    const { data, isLoading, isError } = useQuery({
        queryKey: AGENCY_REVIEW_KEYS.data,
        queryFn: async () => {
            const response = await agencyOnboardingAPI.getAgencyOnboardingData();
            return response.data.data;
        },
    });

    const resubmission = useApplicationResubmission({
        resubmitFn: agencyOnboardingAPI.resubmitAgencyApplication,
    });

    const documents = data?.documents ?? [];
    const findDocument = (documentType) => documents.find((d) => d.documentType === documentType) ?? null;

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-text-main">Update your application</h1>
                <p className="text-sm text-text-muted leading-relaxed">
                    Replace the documents our team flagged, then resubmit. Everything else stays as you left it.
                </p>
            </header>

            {isRejected && <ReviewerFeedbackCard rejectionReason={customer?.rejectionReason ?? null} />}

            <section className="space-y-3" aria-labelledby="agency-documents-heading">
                <h2 id="agency-documents-heading" className="text-lg font-bold text-text-main">
                    Your documents
                </h2>

                {isLoading && <p className="text-sm text-text-muted">Loading your documents…</p>}
                {isError && (
                    <p className="text-sm text-red-600">
                        We couldn&apos;t load your documents. Refresh the page to try again.
                    </p>
                )}

                {!isLoading && !isError && (
                    <div className="space-y-3">
                        {AGENCY_DOCUMENT_SLOTS.map(({ key, label, required }) => (
                            <ApplicationDocumentSlot
                                key={key}
                                label={label}
                                documentType={key}
                                isRequired={required}
                                document={findDocument(key)}
                                uploadFn={agencyOnboardingAPI.uploadAgencyDocument}
                                onReplaced={resubmission.markReplaced}
                            />
                        ))}
                    </div>
                )}
            </section>

            <ResubmitApplicationFooter
                note={resubmission.note}
                isNoteVisible={resubmission.isNoteVisible}
                isConfirmOpen={resubmission.isConfirmOpen}
                isDirty={resubmission.isDirty}
                isSubmitting={resubmission.isSubmitting}
                onOpenConfirm={resubmission.handleOpenConfirm}
                onCloseConfirm={resubmission.handleCloseConfirm}
                onConfirm={resubmission.handleConfirm}
                onToggleNote={resubmission.handleToggleNote}
                onNoteChange={resubmission.handleNoteChange}
            />
        </div>
    );
}