"use client";

import Link from "next/link";
import { useAdminCustomer } from "@/hooks/useAdmin";
import { PendingReviewBadge } from "@/components/features/admin/PendingReviewBadge";
import { APPROVAL_STATUS, CUSTOMER_TYPES } from "@/lib/constants";
import { formatShortDate } from "@/utils/dates";
import { CustomerDocumentList } from "./CustomerDocumentList";
import { CustomerSignatureList } from "./CustomerSignatureList";
import { CustomerDecisionPanel } from "./CustomerDecisionPanel";
import { CustomerIdentitySection } from "./CustomerIdentitySection";
import { CustomerSectionCard } from "./CustomerSectionCard";

const STATUS_STYLES = {
    [APPROVAL_STATUS.PENDING]: "bg-slate-100 text-slate-600",
    [APPROVAL_STATUS.REVIEW]: "bg-amber-50 text-amber-700",
    [APPROVAL_STATUS.APPROVED]: "bg-green-50 text-green-700",
    [APPROVAL_STATUS.REJECTED]: "bg-red-50 text-red-700",
};

const STATUS_LABELS = {
    [APPROVAL_STATUS.PENDING]: "Pending",
    [APPROVAL_STATUS.REVIEW]: "In Review",
    [APPROVAL_STATUS.APPROVED]: "Approved",
    [APPROVAL_STATUS.REJECTED]: "Rejected",
};

/**
 * Full admin detail view for a single customer.
 * Branches on customerType for identity and document sections.
 * Handles loading, error, and not-found states inline.
 *
 * @param {{ customerUserId: string }} props
 */
export function AdminCustomerDetail({ customerUserId }) {
    const { data, isLoading, isError, error } = useAdminCustomer(customerUserId);

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-8 w-64 bg-slate-200 rounded" />
                <div className="h-40 bg-slate-100 rounded-xl" />
                <div className="h-56 bg-slate-100 rounded-xl" />
                <div className="h-40 bg-slate-100 rounded-xl" />
            </div>
        );
    }

    if (isError || !data || !data.customerProfile) {
        return (
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <Link href="/admin/customers" className="text-xs text-text-muted hover:text-primary mb-4 inline-block">
                    ← Back to Customer Applications
                </Link>
                <div className="bg-card-light border border-border-light rounded-xl p-12 text-center">
                    <p className="text-sm font-semibold text-text-main mb-1">Customer not found</p>
                    <p className="text-xs text-text-muted">{error?.response?.data?.message || "This customer may have been removed."}</p>
                </div>
            </div>
        );
    }

    const { email, createdAt, customerProfile } = data;
    const {
        customerType, approvalStatus, documents, signatures, reviewStartedAt, _count,
    } = customerProfile;

    const isAgency = customerType === CUSTOMER_TYPES.AGENCY;
    const displayName = isAgency
        ? (customerProfile.agencyName || customerProfile.dbaName || customerProfile.fullName || "—")
        : (customerProfile.fullName || "—");

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
            <Link href="/admin/customers" className="text-xs text-text-muted hover:text-primary inline-block">
                ← Back to Customer Applications
            </Link>

            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-text-main">{displayName}</h1>
                    <p className="text-sm text-text-muted mt-0.5">{email}</p>
                    <p className="text-xs text-text-muted mt-1">
                        Applied {formatShortDate(createdAt)}
                        {_count && (
                            <> · {_count.patients} patient{_count.patients !== 1 ? "s" : ""} · {_count.subscriptions} subscription{_count.subscriptions !== 1 ? "s" : ""}</>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[approvalStatus] || "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[approvalStatus] || approvalStatus}
                    </span>
                    <PendingReviewBadge pendingReviewAt={customerProfile.pendingReviewAt} size="md" />
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-blue-50 text-blue-700">
                        {customerType}
                    </span>
                </div>
            </div>

            <CustomerDecisionPanel customer={customerProfile} customerUserId={customerUserId} />

            <CustomerIdentitySection profile={customerProfile} />

            <CustomerSectionCard title={`Documents (${documents.length})`}>
                <CustomerDocumentList
                    documents={documents}
                    customerUserId={customerUserId}
                    reviewStartedAt={reviewStartedAt}
                />
            </CustomerSectionCard>

            <CustomerSectionCard title={isAgency ? "Compliance Signatures" : "Consent Signatures"}>
                <CustomerSignatureList signatures={signatures} customerType={customerType} />
            </CustomerSectionCard>
        </div>
    );
}
