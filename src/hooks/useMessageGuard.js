"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { APPROVAL_STATUS } from "@/lib/constants";
import { resolveCustomerGateState } from "@/lib/customerRouteAccess";

/**
 * Guards the "message a therapist" action behind onboarding and approval state.
 * Opens the MessageGateModal when the customer is not yet approved.
 *
 * @returns {{ guardedHandleMessage: (therapistUserId: string) => void, isGateOpen: boolean, closeGate: () => void, gateProps: object }}
 */
export function useMessageGuard() {
    const router = useRouter();
    const customer = useCustomerUser();
    const [isGateOpen, setIsGateOpen] = useState(false);

    const approvalStatus = customer?.approvalStatus ?? null;
    const onboardingComplete = customer?.onboardingComplete ?? false;
    const customerType = customer?.customerType ?? null;
    const rejectionReason = customer?.rejectionReason ?? null;
    const onboardingStep = customer?.onboardingStep ?? 1;

    const isBlocked = approvalStatus !== APPROVAL_STATUS.APPROVED;

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
        gateProps: {
            gateState: resolveCustomerGateState({ approvalStatus, onboardingComplete }),
            onboardingStep,
            customerType,
            rejectionReason,
        },
    };
}
