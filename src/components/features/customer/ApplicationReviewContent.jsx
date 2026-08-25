"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { APPROVAL_STATUS, CUSTOMER_TYPES } from "@/lib/constants";
import { AgencyApplicationReview } from "@/components/features/customer/AgencyApplicationReview";
import { IndividualApplicationReview } from "@/components/features/customer/IndividualApplicationReview";

/**
 * Routes an unapproved customer to the review screen matching their customer type.
 * Approved customers have nothing to fix, so they are bounced to the dashboard.
 */
export default function ApplicationReviewContent() {
    const customer = useCustomerUser();
    const router = useRouter();
    const isApproved = customer?.approvalStatus === APPROVAL_STATUS.APPROVED;

    useEffect(() => {
        if (isApproved) router.replace("/customer/dashboard");
    }, [isApproved, router]);

    if (isApproved) return null;

    if (customer?.customerType === CUSTOMER_TYPES.AGENCY) return <AgencyApplicationReview />;
    if (customer?.customerType === CUSTOMER_TYPES.INDIVIDUAL) return <IndividualApplicationReview />;

    return null;
}