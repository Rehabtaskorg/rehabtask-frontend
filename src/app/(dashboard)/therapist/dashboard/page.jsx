"use client";

import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import DashboardPendingView from "@/components/therapist/dashboard/DashboardPendingView";
import DashboardRejectedView from "@/components/therapist/dashboard/DashboardRejectedView";
import DashboardApprovedView from "@/components/therapist/dashboard/DashboardApprovedView";

export default function TherapistDashboard() {
    const { approvalStatus } = useTherapistAccess();

    if (approvalStatus === "pending" || approvalStatus === "review") {
        return <DashboardPendingView />
    }

    if (approvalStatus === "rejected") {
        return <DashboardRejectedView />
    }

    return <DashboardApprovedView />
}