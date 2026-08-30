"use client";

import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import { usePageTitle } from "@/hooks/usePageTitle";
import { APPROVAL_STATUS } from "@/lib/constants";
import { TherapistPayoutSetupView } from "@/components/therapist/payouts/TherapistPayoutSetupView";

export default function TherapistPayoutsPage() {
    usePageTitle("Payout Account");
    const { approvalStatus } = useTherapistAccess();

    if (approvalStatus === APPROVAL_STATUS.REJECTED) return null;

    return <TherapistPayoutSetupView />;
}