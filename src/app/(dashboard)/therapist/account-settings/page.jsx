"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { MdPayments, MdSettings, MdCheckCircle, MdTrendingUp, MdError, MdWarning, MdInfo } from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import { logger } from "@/lib/logger";

export default function TherapistAccountSettingsPage() {
    usePageTitle("Account Settings");
    return <AccountSettingsContent />;
}

function AccountSettingsContent() {
    const router = useRouter();
    const [accountStatus, setAccountStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAccountStatus = async () => {
        try {
            const res = await api.get("/payments/connect/status");
            setAccountStatus(res.data.data);
        } catch (error) {
            logger.error("Error fetching account status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountStatus();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold text-text-main  mb-6">Account Settings</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-slate-200  rounded-xl" />
                </div>
            </div>
        );
    }

    const isFullyActive =
        accountStatus?.connected &&
        accountStatus?.onboardingComplete;

    const isNotActive =
        accountStatus?.connected &&
        accountStatus?.detailsSubmitted &&
        !accountStatus?.onboardingComplete;

    const isPastDue = isNotActive && (accountStatus?.pastDueCount ?? 0) > 0;
    const isCurrentlyDue = isNotActive && !isPastDue && (accountStatus?.currentlyDueCount ?? 0) > 0;
    const hasUpcoming = isNotActive && !isPastDue && !isCurrentlyDue && accountStatus?.hasUpcomingRequirements;
    const isPendingReview = isNotActive && !isPastDue && !isCurrentlyDue && !hasUpcoming;

    const deadlineDate = accountStatus?.currentDeadline
        ? new Date(accountStatus.currentDeadline * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : null;
    const futureDateStr = accountStatus?.futureDeadline
        ? new Date(accountStatus.futureDeadline * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : null;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <MdSettings className="text-primary text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-text-main ">Account Settings</h1>
            </div>

            {/* Payment Setup Section */}
            <div className="bg-card-light  rounded-xl shadow-sm border border-border-light  p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MdPayments className="text-primary text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-text-main ">Payment Setup</h2>
                        <p className="text-sm text-text-muted ">Manage your payout account for receiving session payments</p>
                    </div>
                </div>

                {/* State: Not connected */}
                {!accountStatus?.connected && (
                    <div className="space-y-4">
                        <div className="bg-amber-50  border border-amber-200  rounded-lg p-4">
                            <h3 className="font-semibold text-amber-900  mb-1">
                                Connect your bank account to receive payments
                            </h3>
                            <p className="text-sm text-amber-800 ">
                                You need to set up a payout account before you can receive earnings from completed sessions.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="bg-primary hover:brightness-95 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                            Set Up Payouts
                        </button>
                        <p className="text-xs text-text-muted ">
                            Your bank details are encrypted by our trusted payments processor — RehabTask never stores them.
                        </p>
                    </div>
                )}

                {/* State: Connected but setup incomplete (account exists, details not submitted) */}
                {accountStatus?.connected && !accountStatus?.detailsSubmitted && (
                    <div className="space-y-4">
                        <div className="bg-amber-50  border border-amber-200  rounded-lg p-4">
                            <h3 className="font-semibold text-amber-900  mb-1">
                                Complete your payout account setup
                            </h3>
                            <p className="text-sm text-amber-800 ">
                                Your account was created but setup is not finished. Please complete all required fields to start receiving payments.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="bg-primary hover:brightness-95 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                            Complete Setup
                        </button>
                    </div>
                )}

                {/* Stage 3 — CRITICAL: past_due, account restricted */}
                {isPastDue && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-red-50  border border-red-300  rounded-lg p-4">
                            <MdError className="text-red-500 text-xl shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-700  mb-1">Payout account restricted</h3>
                                <p className="text-sm text-red-600/80 ">
                                    Stripe requires overdue information to restore your payouts and payments. Complete it now to reactivate your account.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Restore My Account
                        </button>
                    </div>
                )}

                {/* Stage 2 — WARNING: currently_due with deadline */}
                {isCurrentlyDue && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-amber-50  border border-amber-300  rounded-lg p-4">
                            <MdWarning className="text-amber-500 text-xl shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-text-main  mb-1">Action required for your payout account</h3>
                                <p className="text-sm text-text-muted ">
                                    {deadlineDate
                                        ? `Stripe requires updated information by ${deadlineDate}. If not completed, your payouts will be paused.`
                                        : 'Stripe requires updated information. Complete it soon to avoid interruption to your payouts.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Complete Now
                        </button>
                    </div>
                )}

                {/* Stage 1 — PROACTIVE: upcoming future requirements */}
                {hasUpcoming && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-blue-50  border border-blue-200  rounded-lg p-4">
                            <MdInfo className="text-blue-500 text-xl shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-text-main  mb-1">Upcoming requirements for your payout account</h3>
                                <p className="text-sm text-text-muted ">
                                    {futureDateStr
                                        ? `Stripe will require new information by ${futureDateStr}. Complete it now to avoid any interruption.`
                                        : 'Stripe will require new information in the future. Complete it proactively to avoid any interruption.'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="bg-primary hover:brightness-95 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                            Review Requirements
                        </button>
                    </div>
                )}

                {/* Fallback: genuinely pending initial Stripe review */}
                {isPendingReview && (
                    <div className="bg-amber-50  border border-amber-200  rounded-lg p-4">
                        <h3 className="font-semibold text-text-main  mb-1">
                            Payout account under review
                        </h3>
                        <p className="text-sm text-text-muted ">
                            Your details have been submitted and Stripe is verifying your account. This usually takes a few minutes. You&apos;ll be notified once it&apos;s active.
                        </p>
                    </div>
                )}

                {/* State: Fully active */}
                {isFullyActive && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-emerald-50  border border-emerald-200  rounded-lg p-4">
                            <MdCheckCircle className="text-emerald-500 text-xl shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-text-main  mb-0.5">
                                    Payout account active
                                </h3>
                                <p className="text-sm text-text-muted ">
                                    You&apos;ll receive earnings automatically after customers confirm session completion. Payouts typically arrive in 2–7 business days.
                                </p>
                            </div>
                        </div>

                        <div className="pt-1">
                            <button
                                onClick={() => router.push("/therapist/earnings")}
                                className="inline-flex items-center gap-2 bg-primary hover:brightness-95 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                            >
                                <MdTrendingUp className="text-base" />
                                View Balance &amp; Earnings
                            </button>
                            <p className="text-xs text-text-muted  mt-2">
                                View your balance, cash out instantly, manage your bank account, and see your full transaction history.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <ChangePasswordForm />
        </div>
    );
}
