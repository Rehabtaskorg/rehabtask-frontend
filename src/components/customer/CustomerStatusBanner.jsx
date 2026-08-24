"use client";

import { MdAccessTime, MdInfo } from "react-icons/md";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { resolveCustomerGateState, CUSTOMER_GATE_STATE } from "@/lib/customerRouteAccess";

/**
 * Persistent banner shown on all customer dashboard pages when the account
 * is not yet approved. Reads from CustomerUserContext — makes zero network calls.
 * Returns null for approved customers.
 */
export function CustomerStatusBanner() {
    const customer = useCustomerUser();

    const gateState = resolveCustomerGateState({
        approvalStatus: customer?.approvalStatus ?? null,
        onboardingComplete: customer?.onboardingComplete ?? false,
    });

    if (gateState === CUSTOMER_GATE_STATE.NONE) return null;

    const isRejected = gateState === CUSTOMER_GATE_STATE.REJECTED;

    const bg = isRejected ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200";
    const textColor = isRejected ? "text-red-800" : "text-amber-800";
    const iconColor = isRejected ? "text-red-500" : "text-amber-500";
    const Icon = isRejected ? MdInfo : MdAccessTime;

    const message = isRejected
        ? (customer?.rejectionReason
            ? `Your application was not approved: ${customer.rejectionReason}. Contact support for assistance.`
            : "Your application was not approved. Please contact support for assistance.")
        : "Your account is under review. You'll be notified by email once our team has made a decision.";

    return (
        <div className={`w-full border-b ${bg} px-4 py-3 flex items-center gap-3`} role="status">
            <Icon className={`shrink-0 text-lg ${iconColor}`} aria-hidden="true" />
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
    );
}
