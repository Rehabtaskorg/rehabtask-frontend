"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MdDownload, MdAccountBalanceWallet, MdError } from "react-icons/md";
import { ConnectBalances, ConnectPayments } from "@stripe/react-connect-js";
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
import StripeConnectProvider from "@/components/stripe/StripeConnectProvider";

export default function TherapistEarningsPage() {
    const { canAccessMarketplace } = useTherapistAccess();
    if (!canAccessMarketplace) return <LockedPageOverlay pageType="earnings" />;
    return <TherapistEarningsContent />;
}

function TherapistEarningsContent() {
    usePageTitle("Earnings");

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Stripe Connect account status — drives which panel is shown
    // null = not yet fetched, object = fetched (connected/not connected)
    const [stripeStatus, setStripeStatus] = useState(null);
    const [stripeStatusLoading, setStripeStatusLoading] = useState(true);
    const [stripeLoadError, setStripeLoadError] = useState(null);

    useEffect(() => {
        // Run both fetches in parallel — earnings data and Stripe status are independent
        Promise.all([fetchPayouts(), fetchStripeStatus()]);
    }, []);

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
            // Non-fatal: if status check fails we degrade gracefully to the CTA
            setStripeStatus({ connected: false });
        } finally {
            setStripeStatusLoading(false);
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

    const handleStripeLoadError = useCallback((err) => {
        console.error("[EarningsPage] Stripe SDK load error:", err);
        setStripeLoadError(
            "Failed to load the balance panel. Please refresh the page."
        );
    }, []);

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
    const isStripeReady =
        stripeStatus?.connected &&
        stripeStatus?.detailsSubmitted &&
        stripeStatus?.chargesEnabled;

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-extrabold tracking-tight text-text-main dark:text-white">Earnings</h1>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-4 py-2 border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-sm font-semibold text-text-main dark:text-white transition-colors"
                >
                    <MdDownload className="text-lg" />
                    Export CSV
                </button>
            </header>

            {/* Platform Earnings Summary — your DB data, always shown */}
            <EarningsSummaryCards
                totalEarnings={data.totalEarnings}
                pendingEarnings={data.pendingEarnings}
                pendingSessionCount={data.pendingSessionCount}
                periodStats={data.periodStats}
                commissionInfo={data.commissionInfo}
            />

            {/* ── Stripe Balance Panel ─────────────────────────────────────────────
                Rendered between summary cards and the chart.
                Four states:
                  1. Loading  — skeleton placeholder while status is being fetched
                  2. Not connected — CTA directing to onboarding/stripe
                  3. Connected + submitted but not yet charges_enabled — pending review
                  4. Fully active — ConnectBalances + ConnectPayments components
            ──────────────────────────────────────────────────────────────────── */}
            <StripeBalancePanel
                statusLoading={stripeStatusLoading}
                stripeStatus={stripeStatus}
                isStripeReady={isStripeReady}
                stripeLoadError={stripeLoadError}
                onLoadError={handleStripeLoadError}
            />

            {/* Platform Earnings Chart — your DB data */}
            <EarningsChart earningsByMonth={data.earningsByMonth} />

            {/* Platform Payout History — your DB data */}
            <PayoutHistoryTable payments={data.payments || []} />

            {/* Escrow Info */}
            <EscrowInfoBanner hasEscrowedPayments={hasEscrowedPayments} />
        </div>
    );
}

/**
 * StripeBalancePanel
 *
 * Handles all four Stripe status states in a single isolated component.
 * Kept separate from TherapistEarningsContent so the Stripe SDK lifecycle
 * (loadConnectAndInitialize) is contained and doesn't affect the parent.
 */
function StripeBalancePanel({
    statusLoading,
    stripeStatus,
    isStripeReady,
    stripeLoadError,
    onLoadError,
}) {
    const router = useRouter();

    // State 1 — still fetching status
    if (statusLoading) {
        return (
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 animate-pulse">
                <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-5" />
                <div className="flex gap-6 mb-4">
                    <div className="h-16 flex-1 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-16 flex-1 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-16 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
            </div>
        );
    }

    // State 2 — no Stripe account connected
    if (!stripeStatus?.connected) {
        return (
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <MdAccountBalanceWallet className="text-xl text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-text-main dark:text-white">Set up payouts</p>
                            <p className="text-sm text-text-muted dark:text-slate-400 mt-0.5">
                                Connect your bank account to receive earnings directly. View your balance and cash out instantly.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/therapist/onboarding/stripe")}
                        className="shrink-0 px-5 py-2.5 bg-primary hover:brightness-95 text-white rounded-lg font-semibold text-sm transition-all"
                    >
                        Set Up Payouts
                    </button>
                </div>
            </div>
        );
    }

    // State 3 — account exists + details submitted, but charges not yet enabled.
    // The review is async on the provider side and the account.updated webhook
    // will flip stripeOnboardingComplete when it completes.
    if (stripeStatus?.connected && stripeStatus?.detailsSubmitted && !stripeStatus?.chargesEnabled) {
        return (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 rounded-xl shadow-sm p-6">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                        <MdAccountBalanceWallet className="text-xl text-amber-500" />
                    </div>
                    <div>
                        <p className="font-bold text-text-main dark:text-white">Payout account under review</p>
                        <p className="text-sm text-text-muted dark:text-slate-400 mt-0.5">
                            Your details have been submitted and we&apos;re verifying your account. This usually takes a few minutes. You&apos;ll be notified once it&apos;s active.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // State 4 — fully active.
    // ConnectBalances renders the available/pending balance, instant payout
    // ("Cash Out"), and bank account management UI. It ships with its own
    // section heading so we don't add one on top.
    // ConnectPayments renders the transfer history and dispute workflow.
    // Both are wrapped in cards that match the visual language of the rest
    // of the earnings page (p-6 md:p-8, shadow-sm, rounded-xl). onLoadError
    // is passed per-component so a failure in one does not blank the other.
    if (isStripeReady) {
        if (stripeLoadError) {
            return (
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6">
                    <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
                        <MdError className="text-xl shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-sm">Balance panel unavailable</p>
                            <p className="text-xs text-text-muted dark:text-slate-400 mt-0.5">{stripeLoadError}</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <StripeConnectProvider>
                <div className="space-y-6">
                    <section
                        aria-label="Balance and payouts"
                        className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6 md:p-8"
                    >
                        {/* onLoadError passed directly — ConnectComponentsProvider does not support it */}
                        <ConnectBalances onLoadError={onLoadError} />
                    </section>

                    <section
                        aria-label="Transaction history"
                        className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6 md:p-8"
                    >
                        <ConnectPayments onLoadError={onLoadError} />
                    </section>
                </div>
            </StripeConnectProvider>
        );
    }

    // Fallback — connected but unknown state (e.g. payoutsEnabled only)
    return null;
}
