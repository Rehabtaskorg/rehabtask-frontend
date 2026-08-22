"use client";

import Link from "next/link";
import { useAdminCustomer } from "@/hooks/useAdmin";
import { APPROVAL_STATUS, CUSTOMER_TYPES } from "@/lib/constants";
import { formatShortDate, calculateAge } from "@/utils/dates";
import { CustomerDocumentList } from "./CustomerDocumentList";
import { CustomerSignatureList } from "./CustomerSignatureList";
import { CustomerDecisionPanel } from "./CustomerDecisionPanel";

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
 * A labelled field row used across both identity sections.
 * @param {{ label: string, value: string|null|undefined }} props
 */
function Field({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
            <p className="text-sm text-text-main mt-0.5">{value || "—"}</p>
        </div>
    );
}

/**
 * Shared card shell for each detail section.
 * @param {{ title: string, children: React.ReactNode }} props
 */
function SectionCard({ title, children }) {
    return (
        <div className="bg-card-light border border-border-light rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-text-main">{title}</h2>
            {children}
        </div>
    );
}

/**
 * Identity section for agency customers.
 * @param {{ profile: object }} props
 */
function AgencyIdentitySection({ profile }) {
    const address = [profile.addressLine1, profile.addressLine2, profile.city, profile.state, profile.zipCode]
        .filter(Boolean).join(", ") || null;

    return (
        <SectionCard title="Business Identity">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Legal name" value={profile.agencyName} />
                <Field label="DBA" value={profile.dbaName} />
                <Field label="EIN" value={profile.ein} />
                <Field label="Billing email" value={profile.billingEmail} />
                <Field label="Contact name" value={profile.fullName} />
                <Field label="Phone" value={profile.phone} />
                <Field label="Address" value={address} />
            </div>
        </SectionCard>
    );
}

/**
 * Identity section for individual customers.
 * @param {{ profile: object }} props
 */
function IndividualIdentitySection({ profile }) {
    const age = calculateAge(profile.dateOfBirth);
    const dobDisplay = profile.dateOfBirth
        ? `${formatShortDate(profile.dateOfBirth)}${age != null ? ` (age ${age})` : ""}`
        : null;

    const address = [profile.addressLine1, profile.addressLine2, profile.city, profile.state, profile.zipCode]
        .filter(Boolean).join(", ") || null;

    return (
        <SectionCard title="Patient Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full name" value={profile.fullName} />
                <Field label="Date of birth" value={dobDisplay} />
                <Field label="Primary diagnosis" value={profile.primaryDiagnosis} />
                <Field label="Referring provider" value={profile.referringProviderName} />
                <Field label="Phone" value={profile.phone} />
                <Field label="Address" value={address} />
            </div>
        </SectionCard>
    );
}

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
        customerType, approvalStatus, documents, signatures, _count,
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
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[approvalStatus] || "bg-slate-100 text-slate-600"}`}>
                        {STATUS_LABELS[approvalStatus] || approvalStatus}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-blue-50 text-blue-700">
                        {customerType}
                    </span>
                </div>
            </div>

            <CustomerDecisionPanel customer={customerProfile} customerUserId={customerUserId} />

            {isAgency
                ? <AgencyIdentitySection profile={customerProfile} />
                : <IndividualIdentitySection profile={customerProfile} />
            }

            <SectionCard title={`Documents (${documents.length})`}>
                <CustomerDocumentList documents={documents} customerUserId={customerUserId} />
            </SectionCard>

            <SectionCard title={isAgency ? "Compliance Signatures" : "Consent Signatures"}>
                <CustomerSignatureList signatures={signatures} customerType={customerType} />
            </SectionCard>
        </div>
    );
}