"use client";

import { useState, useEffect } from "react";
import { MdDownload, MdOpenInNew } from "react-icons/md";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import { showToast } from "@/lib/toast";
import { exportPayoutsCSV } from "@/lib/earnings.utils";
import LockedPageOverlay from "@/components/therapist/LockedPageOverlay";
import EarningsSummaryCards from "@/components/therapist/earnings/EarningsSummaryCards";
import EarningsChart from "@/components/therapist/earnings/EarningsChart";
import PayoutHistoryTable from "@/components/therapist/earnings/PayoutHistoryTable";
import EscrowInfoBanner from "@/components/therapist/earnings/EscrowInfoBanner";
import EarningsPageSkeleton from "@/components/therapist/earnings/EarningsPageSkeleton";

export default function TherapistEarningsPage() {
    const { canAccessMarketplace } = useTherapistAccess();
    if (!canAccessMarketplace) return <LockedPageOverlay pageType="earnings" />;
    return <TherapistEarningsContent />;
}

function TherapistEarningsContent() {
    usePageTitle("Earnings");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openingDashboard, setOpeningDashboard] = useState(false);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const res = await api.get("/payments/payouts");
            setData(res.data.data);
        } catch (error) {
            showToast.error("Failed to load earnings data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenStripeDashboard = async () => {
        setOpeningDashboard(true);
        try {
            const res = await api.post("/payments/dashboard/create");
            window.open(res.data.data.url, "_blank");
        } catch (error) {
            showToast.error(error.response?.data?.message || "Failed to open Stripe Dashboard.");
        } finally {
            setOpeningDashboard(false);
        }
    };

    const handleExportCSV = () => {
        if (!data?.payments?.length) {
            showToast.info("No payout data to export.");
            return;
        }
        exportPayoutsCSV(data.payments);
        showToast.success("CSV exported successfully.");
    };

    if (loading) return <EarningsPageSkeleton />;

    if (!data) {
        return (
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                <h1 className="text-2xl font-extrabold tracking-tight text-text-main dark:text-white mb-6">Earnings</h1>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                    <p className="text-red-800 dark:text-red-300">Failed to load earnings data. Please refresh the page.</p>
                </div>
            </div>
        );
    }

    const hasEscrowedPayments = data.payments?.some((p) => p.status === "escrowed");

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-extrabold tracking-tight text-text-main dark:text-white">Earnings</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-4 py-2 border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-sm font-semibold text-text-main dark:text-white transition-colors"
                    >
                        <MdDownload className="text-lg" />
                        Export CSV
                    </button>
                    <button
                        onClick={handleOpenStripeDashboard}
                        disabled={openingDashboard}
                        className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:brightness-95 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-50"
                    >
                        {openingDashboard ? "Opening..." : "Stripe Dashboard"}
                        <MdOpenInNew className="text-lg" />
                    </button>
                </div>
            </header>

            {/* Summary Stats */}
            <EarningsSummaryCards
                totalEarnings={data.totalEarnings}
                pendingEarnings={data.pendingEarnings}
                pendingSessionCount={data.pendingSessionCount}
                periodStats={data.periodStats}
                commissionInfo={data.commissionInfo}
            />

            {/* Earnings Chart */}
            <EarningsChart earningsByMonth={data.earningsByMonth} />

            {/* Payout History */}
            <PayoutHistoryTable payments={data.payments || []} />

            {/* Escrow Info */}
            <EscrowInfoBanner hasEscrowedPayments={hasEscrowedPayments} />
        </div>
    );
}
