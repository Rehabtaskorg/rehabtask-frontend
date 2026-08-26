"use client";

import Link from "next/link";
import { APPROVAL_STATUS, CUSTOMER_TYPES } from "@/lib/constants";

const STATUS_STYLES = {
    [APPROVAL_STATUS.PENDING]: 'bg-slate-100 text-slate-600',
    [APPROVAL_STATUS.REVIEW]: 'bg-amber-50 text-amber-700',
    [APPROVAL_STATUS.APPROVED]: 'bg-green-50 text-green-700',
    [APPROVAL_STATUS.REJECTED]: 'bg-red-50 text-red-700',
};

const STATUS_LABELS = {
    [APPROVAL_STATUS.PENDING]: 'Pending',
    [APPROVAL_STATUS.REVIEW]: 'In Review',
    [APPROVAL_STATUS.APPROVED]: 'Approved',
    [APPROVAL_STATUS.REJECTED]: 'Rejected',
};

const TYPE_STYLES = {
    [CUSTOMER_TYPES.AGENCY]: 'bg-blue-50 text-blue-700',
    [CUSTOMER_TYPES.INDIVIDUAL]: 'bg-purple-50 text-purple-700',
};

/**
 * Resolves the display name for a customer — agency name takes priority over full name.
 * @param {{ customerType: string, agencyName?: string, dbaName?: string, fullName?: string }} customer
 * @returns {string}
 */
function resolveDisplayName(customer) {
    if (customer.customerType === CUSTOMER_TYPES.AGENCY) {
        return customer.agencyName || customer.dbaName || '—';
    }
    return customer.fullName || '—';
}

/**
 * Formats a UTC ISO date string to a short locale date (e.g. "Aug 22, 2026").
 * @param {string} iso
 * @returns {string}
 */
function fmtDate(iso) {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

/**
 * A single row in the admin customer table.
 * Clicking anywhere on the row navigates to the customer detail page.
 * Uses `customer.user.id` (the Firebase UID) — NOT `customer.id` (the profile UUID) —
 * because the detail endpoint is keyed on userId.
 *
 * @param {{ customer: object }} props
 */
export function CustomerTableRow({ customer }) {
    const displayName = resolveDisplayName(customer);
    const location = [customer.city, customer.state].filter(Boolean).join(', ') || '—';
    const isResubmitted = customer.approvalStatus === APPROVAL_STATUS.REVIEW && Boolean(customer.rejectionReason);

    return (
        <tr className="hover:bg-slate-50 transition-colors cursor-pointer">
            <td className="px-4 py-3">
                <Link href={`/admin/customers/${customer.user.id}`} className="block">
                    <p className="text-sm font-medium text-text-main">{displayName}</p>
                    <p className="text-xs text-text-muted">{customer.user.email}</p>
                </Link>
            </td>
            <td className="px-4 py-3">
                <Link href={`/admin/customers/${customer.user.id}`} className="block">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${TYPE_STYLES[customer.customerType] || 'bg-slate-100 text-slate-600'}`}>
                        {customer.customerType}
                    </span>
                </Link>
            </td>
            <td className="px-4 py-3">
                <Link href={`/admin/customers/${customer.user.id}`} className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[customer.approvalStatus] || 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS[customer.approvalStatus] || customer.approvalStatus}
                    </span>
                    {isResubmitted && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            Resubmitted
                        </span>
                    )}
                </Link>
            </td>
            <td className="px-4 py-3">
                <Link href={`/admin/customers/${customer.user.id}`} className="block">
                    <span className="text-sm text-text-muted">{location}</span>
                </Link>
            </td>
            <td className="px-4 py-3">
                <Link href={`/admin/customers/${customer.user.id}`} className="block">
                    <span className="text-sm text-text-muted">{fmtDate(customer.createdAt)}</span>
                </Link>
            </td>
            <td className="px-4 py-3">
                <Link href={`/admin/customers/${customer.user.id}`} className="block">
                    <span className="text-sm text-text-muted">{customer.documentCount ?? 0}</span>
                </Link>
            </td>
        </tr>
    );
}