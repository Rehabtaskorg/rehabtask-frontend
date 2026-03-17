"use client";

import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import DashboardPendingView from "@/components/therapist/dashboard/DashboardPendingView";
import DashboardRejectedView from "@/components/therapist/dashboard/DashboardRejectedView";
import DashboardApprovedView from "@/components/therapist/dashboard/DashboardApprovedView";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function TherapistDashboard() {
    usePageTitle("Dashboard");
    const { approvalStatus } = useTherapistAccess();

    if (approvalStatus === "pending" || approvalStatus === "review") {
        return <DashboardPendingView />
    }

    if (approvalStatus === "rejected") {
        return <DashboardRejectedView />
    }

    return <DashboardApprovedView />
}