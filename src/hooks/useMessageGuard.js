"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { CUSTOMER_TYPES, APPROVAL_STATUS } from "@/lib/constants";
import { AGENCY_ONBOARDING_STEP_ROUTES } from "@/lib/customerRouteAccess";

/**
 * Returns a guarded message handler for customer-facing therapist message buttons.
 * Agency customers who haven't completed onboarding see a modal instead of navigating.
 * All other customer types (individual, null) pass through immediately.
 *
 * @returns {{ guardedHandleMessage: (therapistUserId: string) => void, isGateOpen: boolean, closeGate: () => void, onboardingStep: number }}
 */
export function useMessageGuard() {
    const router = useRouter();
    const customer = useCustomerUser();
    const [isGateOpen, setIsGateOpen] = useState(false);

    const isAgency = customer?.customerType === CUSTOMER_TYPES.AGENCY;
    const isApproved = customer?.approvalStatus === APPROVAL_STATUS.APPROVED;
    const isBlocked = isAgency && !isApproved;

    const guardedHandleMessage = (therapistUserId) => {
        if (isBlocked) {
            setIsGateOpen(true);
            return;
        }
        router.push(`/customer/messages?c=new:${therapistUserId}`);
    };

    return {
        guardedHandleMessage,
        isGateOpen,
        closeGate: () => setIsGateOpen(false),
        onboardingStep: customer?.onboardingStep ?? 1,
    };
}