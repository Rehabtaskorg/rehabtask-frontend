"use client";

import { StripeBusinessStructureStep } from "@/components/therapist/onboarding/stripe/StripeBusinessStructureStep";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { CUSTOMER_TYPES } from "@/lib/constants";

/**
 * Business structure pre-screen for the customer payout account.
 * Agencies must pick a registered business structure; individual customers
 * only ever receive refunds personally, so the individual option is the only
 * valid choice for them and the backend enforces the same rule.
 *
 * @param {{ onConfirm: (structure: string) => void, isSubmitting?: boolean }} props
 * @returns {JSX.Element}
 */
export const CustomerPayoutStructureStep = ({ onConfirm, isSubmitting = false }) => {
    const { customerType } = useCustomerUser();
    const isAgency = customerType === CUSTOMER_TYPES.AGENCY;

    if (!isAgency) {
        return (
            <StripeBusinessStructureStep
                onConfirm={onConfirm}
                showIndividual
                showBusiness={false}
                isSubmitting={isSubmitting}
            />
        );
    }

    return (
        <StripeBusinessStructureStep
            onConfirm={onConfirm}
            showIndividual={false}
            isSubmitting={isSubmitting}
        />
    );
};