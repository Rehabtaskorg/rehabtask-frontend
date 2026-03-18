"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import { MdPayments, MdSettings } from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function TherapistAccountSettingsPage() {
    usePageTitle("Account Settings");
    return (
        <Suspense fallback={
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">Account Settings</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
            </div>
        }>
            <AccountSettingsContent />
        </Suspense>
    );
}

function AccountSettingsContent() {
    const searchParams = useSearchParams();
    const [accountStatus, setAccountStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [accessingDashboard, setAccessingDashboard] = useState(false);

    useEffect(() => {
        fetchAccountStatus();

        // Handle Stripe Connect return
        if (searchParams.get("stripe_success") === "true") {
            alert("Stripe account connected successfully!");
            window.history.replaceState({}, "", "/therapist/account-settings");
        }
    }, [searchParams]);

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

    const handleConnectStripe = async () => {
        setConnecting(true);
        try {
            const res = await api.post("/payments/connect/create");
            window.location.href = res.data.data.url;
        } catch (error) {
            alert("Error connecting Stripe: " + (error.response?.data?.message || "Unknown error"));
            setConnecting(false);
        }
    };

    const handleAccessDashboard = async () => {
        setAccessingDashboard(true);
        try {
            const res = await api.post("/payments/dashboard/create");
            window.open(res.data.data.url, "_blank");
        } catch (error) {
            alert("Error accessing dashboard: " + (error.response?.data?.message || "Unknown error"));
        } finally {
            setAccessingDashboard(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">Account Settings</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <MdSettings className="text-primary text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-text-main dark:text-white">Account Settings</h1>
            </div>

            {/* Payment Setup Section */}
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MdPayments className="text-primary text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-text-main dark:text-white">Payment Setup</h2>
                        <p className="text-sm text-text-muted">Manage your Stripe account for receiving payments</p>
                    </div>
                </div>

                {!accountStatus?.connected ? (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                                Connect your Stripe account to receive payments
                            </h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
                                You need to connect a Stripe account to receive payouts for completed sessions.
                            </p>
                        </div>

                        <button
                            onClick={handleConnectStripe}
                            disabled={connecting}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {connecting ? "Redirecting..." : "Connect Stripe Account"}
                        </button>

                        <div className="text-xs text-text-muted dark:text-gray-400 space-y-1">
                            <p>Stripe is a secure payment platform used by millions of businesses.</p>
                            <p>You&apos;ll be redirected to Stripe to complete setup. It takes about 5 minutes.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {accountStatus.detailsSubmitted ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                                    Stripe account connected
                                </h3>
                                <div className="text-sm text-green-800 dark:text-green-300 space-y-1">
                                    <p>Charges enabled: {accountStatus.chargesEnabled ? "Yes" : "No"}</p>
                                    <p>Payouts enabled: {accountStatus.payoutsEnabled ? "Yes" : "No"}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                                    Complete your Stripe account setup
                                </h3>
                                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
                                    Your account is connected but setup is not complete.
                                </p>
                                <button
                                    onClick={handleConnectStripe}
                                    disabled={connecting}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm transition-colors"
                                >
                                    {connecting ? "Redirecting..." : "Complete Setup"}
                                </button>
                            </div>
                        )}

                        {accountStatus.payoutsEnabled && (
                            <>
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        You&apos;ll receive payouts automatically after customers confirm session completion. Payouts typically arrive in 2-7 business days.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                                    <button
                                        onClick={handleAccessDashboard}
                                        disabled={accessingDashboard}
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                        {accessingDashboard ? "Opening Dashboard..." : "Access Stripe Dashboard"}
                                    </button>
                                    <p className="text-xs text-text-muted dark:text-gray-400 mt-2">
                                        View your balance, payouts, and transaction history
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <ChangePasswordForm />
        </div>
    );
}