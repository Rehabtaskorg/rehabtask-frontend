"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { CUSTOMER_TYPES, APPROVAL_STATUS } from "@/lib/constants";

export function useMessageGuard() {
    const router = useRouter();
    const customer = useCustomerUser();
    const [isGateOpen, setIsGateOpen] = useState(false);

    const customerType = customer?.customerType ?? null;
    const isApproved = customer?.approvalStatus === APPROVAL_STATUS.APPROVED;
    const isBlocked =
        (customerType === CUSTOMER_TYPES.AGENCY || customerType === CUSTOMER_TYPES.INDIVIDUAL) &&
        !isApproved;

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
        customerType,
    };
}