"use client";

import { MdVerifiedUser, MdCheckCircle } from "react-icons/md";
import { Badge, BADGE_VARIANTS, BADGE_SIZES } from "@/components/ui/Badge";
import { APPROVAL_STATUS, CUSTOMER_TYPES } from "@/lib/constants";
import { ProfileCardShell } from "./ProfileCardShell";

const STATUS_CONFIG = {
    [APPROVAL_STATUS.APPROVED]: { variant: BADGE_VARIANTS.SUCCESS, label: "Approved" },
    [APPROVAL_STATUS.PENDING]: { variant: BADGE_VARIANTS.WARNING, label: "Pending" },
    [APPROVAL_STATUS.REVIEW]: { variant: BADGE_VARIANTS.WARNING, label: "Under Review" },
    [APPROVAL_STATUS.REJECTED]: { variant: BADGE_VARIANTS.DANGER, label: "Rejected" },
};

const ACCOUNT_TYPE_LABELS = {
    [CUSTOMER_TYPES.AGENCY]: "Home Health Agency",
    [CUSTOMER_TYPES.INDIVIDUAL]: "Individual Patient",
};

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
                <MdCheckCircle className="text-sm" aria-hidden="true" />
                {isComplete ? completeText : incompleteText}
            </span>
        </div>
    );
}

/**
 * Sidebar summary of account type, approval state and onboarding completion,
 * plus the contextual guidance shown while a decision is outstanding.
 *
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 */
export function AccountStatusCard({ profile }) {
    const status = profile?.approvalStatus;
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[APPROVAL_STATUS.PENDING];
    const isAwaitingDecision =
        status === APPROVAL_STATUS.PENDING || status === APPROVAL_STATUS.REVIEW;

    return (
        <ProfileCardShell icon={MdVerifiedUser} title="Account Status">
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-muted">Account Type</span>
                    <span className="text-xs font-semibold text-text-main">
                        {ACCOUNT_TYPE_LABELS[profile?.customerType] ?? "—"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-muted">Approval</span>
                    <Badge variant={config.variant} size={BADGE_SIZES.MD}>
                        {config.label}
                    </Badge>
                </div>
                <CompletionRow
                    label="Onboarding"
                    isComplete={!!profile?.onboardingComplete}
                    completeText="Complete"
                    incompleteText="Incomplete"
                />
            </div>

            {isAwaitingDecision && (
                <div className="mt-4 border-t border-border-light pt-3">
                    <p className="text-xs text-text-muted">
                        Estimated review time:{" "}
                        <span className="font-semibold text-text-main">24-48 hours</span>
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                        Booking therapists and sending new messages stay paused until a reviewer
                        approves your account.
                    </p>
                </div>
            )}
        </ProfileCardShell>
    );
}
