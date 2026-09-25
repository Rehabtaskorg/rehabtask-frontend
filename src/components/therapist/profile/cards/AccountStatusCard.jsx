"use client";

import { MdCheckCircle } from "react-icons/md";
import { Badge, BADGE_VARIANTS, BADGE_SIZES } from "@/components/ui/Badge";
import { APPROVAL_STATUS } from "@/lib/constants";
import { StatusBadge } from "./StatusBadge";

/**
 * @param {Object} props
 * @param {string} props.label - Row label.
 * @param {boolean} props.isComplete - Drives colour and which of the two texts is shown.
 * @param {string} props.completeText - Text shown when complete.
 * @param {string} props.incompleteText - Text shown when incomplete.
 */
function CompletionRow({ label, isComplete, completeText, incompleteText }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">{label}</span>
            <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${isComplete ? "text-green-600" : "text-yellow-600"}`}
            >
                <MdCheckCircle className="text-sm" />
                {isComplete ? completeText : incompleteText}
            </span>
        </div>
    );
}

/**
 * Sidebar summary of approval, onboarding and payout readiness, plus the
 * contextual guidance shown while an application is pending, in review, or
 * rejected.
 *
 * @param {Object} props
 * @param {Object} props.profile - Therapist profile from `useTherapistProfile`.
 * @param {string} props.approvalStatus - Current `APPROVAL_STATUS` value.
 * @param {boolean} props.isOnboardingComplete - Whether the wizard has been submitted.
 */
export function AccountStatusCard({ profile, approvalStatus, isOnboardingComplete }) {
    const isAwaitingDecision =
        approvalStatus === APPROVAL_STATUS.PENDING || approvalStatus === APPROVAL_STATUS.REVIEW;

    const isUnsubmitted =
        !isOnboardingComplete && profile?.approvalStatus === APPROVAL_STATUS.PENDING;

    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-text-main">Account Status</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Approval</span>
                    {isUnsubmitted ? (
                        <Badge variant={BADGE_VARIANTS.NEUTRAL} size={BADGE_SIZES.MD}>
                            Not Submitted
                        </Badge>
                    ) : (
                        <StatusBadge status={profile?.approvalStatus} />
                    )}
                </div>
                <CompletionRow
                    label="Onboarding"
                    isComplete={!!profile?.onboardingComplete}
                    completeText="Complete"
                    incompleteText="Incomplete"
                />
                <CompletionRow
                    label="Payouts"
                    isComplete={!!profile?.stripeOnboardingComplete}
                    completeText="Active"
                    incompleteText="Not set up"
                />
            </div>

            {isAwaitingDecision && (
                <div className="mt-4 border-t border-border-light pt-3">
                    {isOnboardingComplete ? (
                        <p className="text-xs text-text-muted">
                            Estimated review time:{" "}
                            <span className="font-semibold text-text-main">24-48 hours</span>
                        </p>
                    ) : (
                        <p className="text-xs text-text-muted">
                            Complete your onboarding to submit for review.
                        </p>
                    )}
                    <p className="mt-1 text-xs text-text-muted">
                        Your profile is hidden from patients until approved.
                    </p>
                </div>
            )}

            {approvalStatus === APPROVAL_STATUS.REJECTED && (
                <div className="mt-4 border-t border-red-200 pt-3">
                    <p className="text-xs font-semibold text-red-700">
                        Action required — please update your credentials
                    </p>
                    {profile?.rejectionReason && (
                        <p className="mt-1 text-xs text-red-600">{profile.rejectionReason}</p>
                    )}
                </div>
            )}
        </div>
    );
}
