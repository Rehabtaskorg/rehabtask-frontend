"use client";

import Link from "next/link";
import { MdAccessTime, MdInfo } from "react-icons/md";
import { usePathname } from "next/navigation";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { resolveCustomerGateState, CUSTOMER_GATE_STATE } from "@/lib/customerRouteAccess";

const SUPPRESSED_ROUTES = ["/customer/pending-approval", "/customer/application-review"];

/**
 * Persistent banner shown on all customer dashboard pages when the account
 * is not yet approved. Reads from CustomerUserContext — makes zero network calls.
 * Returns null for approved customers.
 */
export function CustomerStatusBanner() {
    const customer = useCustomerUser();
    const pathname = usePathname();

    const gateState = resolveCustomerGateState({
        approvalStatus: customer?.approvalStatus ?? null,
        onboardingComplete: customer?.onboardingComplete ?? false,
    });

    if (gateState === CUSTOMER_GATE_STATE.NONE) return null;
    if (SUPPRESSED_ROUTES.includes(pathname)) return null;

    const isRejected = gateState === CUSTOMER_GATE_STATE.REJECTED;

    const textColor = isRejected ? "text-amber-900" : "text-amber-800";
    const iconColor = isRejected ? "text-amber-600" : "text-amber-500";
    const Icon = isRejected ? MdInfo : MdAccessTime;

    const message = isRejected
        ? "Action required: your application needs an update before we can approve it."
        : "Your account is under review. You'll be notified by email once our team has made a decision.";

    return (
        <div className="w-full border-b bg-amber-50 border-amber-200 px-4 py-3 flex items-center gap-3" role="status">
            <Icon className={`shrink-0 text-lg ${iconColor}`} aria-hidden="true" />
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
            {isRejected && (
                <Link
                    href="/customer/application-review"
                    className="ml-auto shrink-0 text-sm font-bold text-amber-900 underline hover:no-underline"
                >
                    Review and fix
                </Link>
            )}
        </div>
    );
}
