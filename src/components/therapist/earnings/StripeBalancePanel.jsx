"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MdAccountBalanceWallet, MdError, MdWarning, MdInfo } from "react-icons/md";
import { ConnectBalances, ConnectPayments } from "@stripe/react-connect-js";
import StripeConnectProvider from "@/components/stripe/StripeConnectProvider";
import EmbeddedComponentSkeleton from "./EmbeddedComponentSkeleton";

const AUTO_RETRY_DELAY_MS = 1500;

/**
 * Handles all Stripe account states on the earnings page.
 *
 * States:
 *   1. statusLoading       — skeleton while /payments/connect/status is in flight
 *   2. not connected       — CTA to set up payouts
 *   3. connected, pending  — sub-states for past_due / currently_due / upcoming / review
 *   4. fully active        — ConnectBalances + ConnectPayments embedded components
 *
 * ConnectBalances and ConnectPayments track load errors independently so a
 * failure in one does not suppress the other. Each silently retries once
 * before surfacing an error UI.
 *
 * @param {{ statusLoading: boolean, stripeStatus: object|null, isStripeReady: boolean }} props
 */
export default function StripeBalancePanel({ statusLoading, stripeStatus, isStripeReady }) {
    const router = useRouter();

    const [retryKey, setRetryKey] = useState(0);

    const [balancesLoaded, setBalancesLoaded] = useState(false);
    const [balancesError, setBalancesError] = useState(false);
    const [balancesAutoRetried, setBalancesAutoRetried] = useState(false);

    const [paymentsLoaded, setPaymentsLoaded] = useState(false);
    const [paymentsError, setPaymentsError] = useState(false);
    const [paymentsAutoRetried, setPaymentsAutoRetried] = useState(false);

    const handleBalancesStart = useCallback(() => setBalancesLoaded(true), []);
    const handlePaymentsStart = useCallback(() => setPaymentsLoaded(true), []);

    const handleBalancesError = useCallback(() => {
        if (!balancesAutoRetried) {
            setBalancesAutoRetried(true);
            setBalancesLoaded(false);
            setTimeout(() => setRetryKey((k) => k + 1), AUTO_RETRY_DELAY_MS);
        } else {
            setBalancesError(true);
        }
    }, [balancesAutoRetried]);

    const handlePaymentsError = useCallback(() => {
        if (!paymentsAutoRetried) {
            setPaymentsAutoRetried(true);
            setPaymentsLoaded(false);
            setTimeout(() => setRetryKey((k) => k + 1), AUTO_RETRY_DELAY_MS);
        } else {
            setPaymentsError(true);
        }
    }, [paymentsAutoRetried]);

    const handleRetry = () => {
        setBalancesLoaded(false);
        setBalancesError(false);
        setBalancesAutoRetried(false);
        setPaymentsLoaded(false);
        setPaymentsError(false);
        setPaymentsAutoRetried(false);
        setRetryKey((k) => k + 1);
    };

    // State 1 — status fetch in flight
    if (statusLoading) {
        return (
            <div className="bg-card-light border border-border-light rounded-xl p-6 animate-pulse">
                <div className="h-5 w-36 bg-slate-200 rounded mb-5" />
                <div className="flex gap-6 mb-4">
                    <div className="h-16 flex-1 bg-slate-200 rounded-lg" />
                    <div className="h-16 flex-1 bg-slate-200 rounded-lg" />
                    <div className="h-16 w-32 bg-slate-200 rounded-lg" />
                </div>
            </div>
        );
    }

    // State 2 — no Stripe account
    if (!stripeStatus?.connected) {
        return (
            <div className="bg-card-light border border-border-light rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <MdAccountBalanceWallet className="text-xl text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-text-main">Set up payouts</p>
                            <p className="text-sm text-text-muted mt-0.5">
                                Connect your bank account to receive earnings directly. View your balance and cash out instantly.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/therapist/payouts")}
                        className="shrink-0 px-5 py-2.5 bg-primary hover:brightness-95 text-white rounded-lg font-semibold text-sm transition-all"
                    >
                        Set Up Payouts
                    </button>
                </div>
            </div>
        );
    }

    if (stripeStatus?.connected && !stripeStatus?.detailsSubmitted) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                            <MdWarning className="text-xl text-amber-500" />
                        </div>
                        <div>
                            <p className="font-bold text-text-main">Complete your payout account setup</p>
                            <p className="text-sm text-text-muted mt-0.5">
                                Your account was created but setup is not finished. Complete all required fields to start receiving payments.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/therapist/payouts")}
                        className="shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm transition-colors"
                    >
                        Complete Setup
                    </button>
                </div>
            </div>
        );
    }

    // State 3 — connected + details submitted, not yet fully active
    if (stripeStatus?.connected && stripeStatus?.detailsSubmitted && !stripeStatus?.onboardingComplete) {
        const isPastDue = (stripeStatus.pastDueCount ?? 0) > 0;
        const isCurrentlyDue = (stripeStatus.currentlyDueCount ?? 0) > 0;
        const hasUpcoming = stripeStatus.hasUpcomingRequirements;

        const deadlineDate = stripeStatus.currentDeadline
            ? new Date(stripeStatus.currentDeadline * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : null;
        const futureDateStr = stripeStatus.futureDeadline
            ? new Date(stripeStatus.futureDeadline * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : null;

        if (isPastDue) {
            return (
                <div className="bg-red-50 border border-red-300 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                                <MdError className="text-xl text-red-500" />
                            </div>
                            <div>
                                <p className="font-bold text-red-700">Payout account restricted</p>
                                <p className="text-sm text-red-600/80 mt-0.5">
                                    Stripe requires overdue information to restore your payouts and payments. Complete it now to reactivate your account.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="shrink-0 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                            Restore My Account
                        </button>
                    </div>
                </div>
            );
        }

        if (isCurrentlyDue) {
            return (
                <div className="bg-amber-50 border border-amber-300 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                                <MdWarning className="text-xl text-amber-500" />
                            </div>
                            <div>
                                <p className="font-bold text-text-main">Action required for your payout account</p>
                                <p className="text-sm text-text-muted mt-0.5">
                                    {deadlineDate
                                        ? `Stripe requires updated information by ${deadlineDate}. If not completed, your payouts will be paused.`
                                        : "Stripe requires updated information. Complete it soon to avoid interruption to your payouts."}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                            Complete Now
                        </button>
                    </div>
                </div>
            );
        }

        if (hasUpcoming) {
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0">
                                <MdInfo className="text-xl text-blue-500" />
                            </div>
                            <div>
                                <p className="font-bold text-text-main">Upcoming requirements for your payout account</p>
                                <p className="text-sm text-text-muted mt-0.5">
                                    {futureDateStr
                                        ? `Stripe will require new information by ${futureDateStr}. Complete it now to avoid any interruption.`
                                        : "Stripe will require new information in the future. Complete it proactively to avoid any interruption."}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="shrink-0 px-5 py-2.5 bg-primary hover:brightness-95 text-white rounded-lg font-semibold text-sm transition-colors"
                        >
                            Review Requirements
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-6">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-amber-500/10 rounded-full flex items-center justify-center shrink-0">
                        <MdAccountBalanceWallet className="text-xl text-amber-500" />
                    </div>
                    <div>
                        <p className="font-bold text-text-main">Payout account under review</p>
                        <p className="text-sm text-text-muted mt-0.5">
                            Your details have been submitted and Stripe is verifying your account. This usually takes a few minutes. You&apos;ll be notified once it&apos;s active.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // State 4 — fully active: render ConnectBalances + ConnectPayments
    if (isStripeReady) {
        return (
            <StripeConnectProvider retryKey={retryKey}>
                <div className="space-y-6">
                    <section
                        aria-label="Balance and payouts"
                        className="bg-card-light border border-border-light rounded-xl shadow-sm p-6 md:p-8"
                    >
                        {balancesError ? (
                            <div className="flex items-start gap-3 text-red-600">
                                <MdError className="text-xl shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Balance panel unavailable</p>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        We couldn&apos;t load your balance. Please check your connection.
                                    </p>
                                    <button
                                        onClick={handleRetry}
                                        className="mt-2 text-xs font-semibold text-primary hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {!balancesLoaded && <EmbeddedComponentSkeleton rows={3} />}
                                <div className={balancesLoaded ? "" : "hidden"}>
                                    <ConnectBalances
                                        onLoadError={handleBalancesError}
                                        onLoaderStart={handleBalancesStart}
                                    />
                                </div>
                            </>
                        )}
                    </section>

                    <section
                        aria-label="Transaction history"
                        className="bg-card-light border border-border-light rounded-xl shadow-sm p-6 md:p-8"
                    >
                        {paymentsError ? (
                            <div className="flex items-start gap-3 text-red-600">
                                <MdError className="text-xl shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Transaction history unavailable</p>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        We couldn&apos;t load your transaction history. Please check your connection.
                                    </p>
                                    <button
                                        onClick={handleRetry}
                                        className="mt-2 text-xs font-semibold text-primary hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {!paymentsLoaded && <EmbeddedComponentSkeleton rows={4} />}
                                <div className={paymentsLoaded ? "" : "hidden"}>
                                    <ConnectPayments
                                        onLoadError={handlePaymentsError}
                                        onLoaderStart={handlePaymentsStart}
                                    />
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </StripeConnectProvider>
        );
    }

    return null;
}