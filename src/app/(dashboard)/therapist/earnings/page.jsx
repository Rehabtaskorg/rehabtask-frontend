"use client";

import { useState, useEffect } from "react";
import { MdDownload } from "react-icons/md";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import { showToast } from "@/lib/toast";
import { exportPayoutsCSV } from "@/lib/earnings.utils";
import LockedPageOverlay from "@/components/therapist/LockedPageOverlay";
import { EarningsSummaryCards } from "@/components/therapist/earnings/EarningsSummaryCards";
import EarningsChart from "@/components/therapist/earnings/EarningsChart";
import PayoutHistoryTable from "@/components/therapist/earnings/PayoutHistoryTable";
import EscrowInfoBanner from "@/components/therapist/earnings/EscrowInfoBanner";
import EarningsPageSkeleton from "@/components/therapist/earnings/EarningsPageSkeleton";
import StripeBalancePanel from "@/components/therapist/earnings/StripeBalancePanel";

/**
 * Therapist earnings page — access-gated shell.
 * Renders a locked overlay for therapists without marketplace access.
 *
 * @returns {JSX.Element}
 */
export default function TherapistEarningsPage() {
    const { canAccessMarketplace } = useTherapistAccess();
    if (!canAccessMarketplace) return <LockedPageOverlay pageType="earnings" />;
    return <TherapistEarningsContent />;
}

/**
 * Inner content rendered only when the therapist has marketplace access.
 * Fetches earnings data and Stripe account status in parallel.
 *
 * @returns {JSX.Element}
 */
function TherapistEarningsContent() {
    usePageTitle("Earnings");

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [stripeStatus, setStripeStatus] = useState(null);
    const [stripeStatusLoading, setStripeStatusLoading] = useState(true);

    const fetchPayouts = async () => {
        try {
            const res = await api.get("/payments/payouts");
            setData(res.data.data);
        } catch {
            showToast.error("Failed to load earnings data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchStripeStatus = async () => {
        try {
            const res = await api.get("/payments/connect/status");
            setStripeStatus(res.data.data);
        } catch {
            setStripeStatus({ connected: false });
        } finally {
            setStripeStatusLoading(false);
        }
    };

    useEffect(() => {
        Promise.all([fetchPayouts(), fetchStripeStatus()]);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                <h1 className="text-2xl font-extrabold tracking-tight text-text-main mb-6">Earnings</h1>
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-800">Failed to load earnings data. Please refresh the page.</p>
                </div>
            </div>
        );
    }

    const hasEscrowedPayments = data.payments?.some((p) => p.status === "escrowed");
    const isStripeReady =
        stripeStatus?.connected &&
        stripeStatus?.detailsSubmitted &&
        stripeStatus?.chargesEnabled;

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-extrabold tracking-tight text-text-main">Earnings</h1>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-4 py-2 border border-border-light hover:bg-slate-50 rounded-lg text-sm font-semibold text-text-main transition-colors"
                >
                    <MdDownload className="text-lg" />
                    Export CSV
                </button>
            </header>

            <EarningsSummaryCards
                totalEarnings={data.totalEarnings}
                pendingEarnings={data.pendingEarnings}
                pendingSessionCount={data.pendingSessionCount}
                periodStats={data.periodStats}
                commissionInfo={data.commissionInfo}
            />

            <StripeBalancePanel
                statusLoading={stripeStatusLoading}
                stripeStatus={stripeStatus}
                isStripeReady={isStripeReady}
            />

            <EarningsChart earningsByMonth={data.earningsByMonth} />

            <PayoutHistoryTable payments={data.payments || []} />

            <EscrowInfoBanner hasEscrowedPayments={hasEscrowedPayments} />
        </div>
    );
}
