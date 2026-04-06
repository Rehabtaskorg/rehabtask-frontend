"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { MdPayments, MdSettings, MdCheckCircle, MdTrendingUp } from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function TherapistAccountSettingsPage() {
    usePageTitle("Account Settings");
    return <AccountSettingsContent />;
}

function AccountSettingsContent() {
    const router = useRouter();
    const [accountStatus, setAccountStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccountStatus();
    }, []);

    const fetchAccountStatus = async () => {
        try {
            const res = await api.get("/payments/connect/status");
            setAccountStatus(res.data.data);
        } catch (error) {
            console.error("Error fetching account status:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">Account Settings</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
            </div>
        );
    }

    const isFullyActive =
        accountStatus?.connected &&
        accountStatus?.detailsSubmitted &&
        accountStatus?.chargesEnabled;

    const isPendingReview =
        accountStatus?.connected &&
        accountStatus?.detailsSubmitted &&
        !accountStatus?.chargesEnabled;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <MdSettings className="text-primary text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-text-main dark:text-white">Account Settings</h1>
            </div>

            {/* Payment Setup Section */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MdPayments className="text-primary text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-text-main dark:text-white">Payment Setup</h2>
                        <p className="text-sm text-text-muted dark:text-slate-400">Manage your payout account for receiving session payments</p>
                    </div>
                </div>

                {/* State: Not connected */}
                {!accountStatus?.connected && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                                Connect your bank account to receive payments
                            </h3>
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                You need to set up a payout account before you can receive earnings from completed sessions.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/onboarding/stripe")}
                            className="bg-primary hover:brightness-95 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                            Set Up Payouts
                        </button>
                        <p className="text-xs text-text-muted dark:text-slate-400">
                            Your bank details are encrypted and handled by Stripe — RehabTask never stores them.
                        </p>
                    </div>
                )}

                {/* State: Connected but setup incomplete (account exists, details not submitted) */}
                {accountStatus?.connected && !accountStatus?.detailsSubmitted && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
                                Complete your payout account setup
                            </h3>
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                Your account was created but setup is not finished. Please complete all required fields to start receiving payments.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/onboarding/stripe")}
                            className="bg-primary hover:brightness-95 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                        >
                            Complete Setup
                        </button>
                    </div>
                )}

                {/* State: Submitted, pending Stripe review */}
                {isPendingReview && (
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-4">
                        <h3 className="font-semibold text-text-main dark:text-white mb-1">
                            Payout account under review
                        </h3>
                        <p className="text-sm text-text-muted dark:text-slate-400">
                            Your details have been submitted and Stripe is reviewing your account. This usually takes a few minutes. You&apos;ll be notified once it&apos;s active.
                        </p>
                    </div>
                )}

                {/* State: Fully active */}
                {isFullyActive && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                            <MdCheckCircle className="text-emerald-500 text-xl shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-text-main dark:text-white mb-0.5">
                                    Payout account active
                                </h3>
                                <p className="text-sm text-text-muted dark:text-slate-400">
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
                            <p className="text-xs text-text-muted dark:text-slate-400 mt-2">
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
