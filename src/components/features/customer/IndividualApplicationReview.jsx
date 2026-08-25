"use client";

import { useQuery } from "@tanstack/react-query";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { individualOnboardingAPI } from "@/services/onboarding.individual.api";
import { APPROVAL_STATUS } from "@/lib/constants";
import { INDIVIDUAL_ONBOARDING_STEP_ROUTES } from "@/lib/customerRouteAccess";
import { formatShortDate } from "@/utils/dates";
import { useApplicationResubmission } from "@/hooks/useApplicationResubmission";
import { ReviewerFeedbackCard } from "@/components/features/customer/ReviewerFeedbackCard";
import { ApplicationDocumentSlot } from "@/components/features/customer/ApplicationDocumentSlot";
import { ApplicationSummaryCard } from "@/components/features/customer/ApplicationSummaryCard";
import { ResubmitApplicationFooter } from "@/components/features/customer/ResubmitApplicationFooter";

const INDIVIDUAL_REVIEW_KEYS = { data: ["individual-onboarding", "data"] };

const THERAPY_ORDER_TYPE = "therapy_order";

/**
 * Individual-customer application review screen. Surfaces the reviewer note,
 * the therapy order slot, and read-only summaries of the saved onboarding steps.
 */
export function IndividualApplicationReview() {
    const customer = useCustomerUser();
    const isRejected = customer?.approvalStatus === APPROVAL_STATUS.REJECTED;

    const { data, isLoading, isError } = useQuery({
        queryKey: INDIVIDUAL_REVIEW_KEYS.data,
        queryFn: async () => {
            const response = await individualOnboardingAPI.getIndividualOnboardingData();
            return response.data.data;
        },
    });

    const resubmission = useApplicationResubmission({
        resubmitFn: individualOnboardingAPI.resubmitIndividualApplication,
    });

    const personalInfo = data?.personalInfo;
    const medicalInfo = data?.medicalInfo;

    const address = [
        personalInfo?.addressLine1,
        personalInfo?.addressLine2,
        [personalInfo?.city, personalInfo?.state].filter(Boolean).join(", "),
        personalInfo?.zipCode,
    ]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-text-main">Update your application</h1>
                <p className="text-sm text-text-muted leading-relaxed">
                    Fix whatever our team flagged, then resubmit. Everything else stays as you left it.
                </p>
            </header>

            {isRejected && <ReviewerFeedbackCard rejectionReason={customer?.rejectionReason ?? null} />}

            {isLoading && <p className="text-sm text-text-muted">Loading your application…</p>}
            {isError && (
                <p className="text-sm text-red-600">
                    We couldn&apos;t load your application. Refresh the page to try again.
                </p>
            )}

            {!isLoading && !isError && (
                <>
                    <section className="space-y-3" aria-labelledby="individual-documents-heading">
                        <h2 id="individual-documents-heading" className="text-lg font-bold text-text-main">
                            Therapy order
                        </h2>
                        <ApplicationDocumentSlot
                            label="Therapy Order / Physician Referral"
                            documentType={THERAPY_ORDER_TYPE}
                            document={data?.therapyOrderDocument ?? null}
                            uploadFn={individualOnboardingAPI.uploadDocument}
                            onReplaced={resubmission.markReplaced}
                        />
                    </section>

                    <section className="space-y-3" aria-labelledby="individual-details-heading">
                        <h2 id="individual-details-heading" className="text-lg font-bold text-text-main">
                            Your details
                        </h2>
                        <ApplicationSummaryCard
                            title="Personal information"
                            editHref={INDIVIDUAL_ONBOARDING_STEP_ROUTES[2]}
                            fields={[
                                { label: "Date of birth", value: personalInfo?.dateOfBirth ? formatShortDate(personalInfo.dateOfBirth) : null },
                                { label: "Address", value: address },
                            ]}
                        />
                        <ApplicationSummaryCard
                            title="Medical information"
                            editHref={INDIVIDUAL_ONBOARDING_STEP_ROUTES[3]}
                            fields={[
                                { label: "Primary diagnosis", value: medicalInfo?.primaryDiagnosis },
                                { label: "Referring provider", value: medicalInfo?.referringProviderName },
                            ]}
                        />
                    </section>
                </>
            )}

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