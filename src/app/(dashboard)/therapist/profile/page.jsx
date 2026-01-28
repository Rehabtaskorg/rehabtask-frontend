"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function TherapistProfilePage() {
    const searchParams = useSearchParams();
    const [accountStatus, setAccountStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        fetchAccountStatus();

        // Handle Stripe Connect return
        if (searchParams.get("stripe_success") === "true") {
            alert("Stripe account connected successfuly!");
            window.history.replaceState({}, "", "/therapist/profile");
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
    }

    const handleConnectStripe = async () => {
        setConnecting(true);
        try {
            const res = await api.post("/payments/connect/create");
            window.location.href = res.data.data.url;
        } catch (error) {
            alert("Error connecting Stripe: " + (error.response?.data?.message || "Unknown error"));
            setConnecting(false);
        }
    }

    if (loading) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
                <div className="animate-pulse space-y-4">
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="py-8 px-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Payment Setup</h2>

                {!accountStatus?.connected ? (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-900 mb-2">
                                ⚠️ Connect your Stripe account to receive payments
                            </h3>
                            <p className="text-sm text-yellow-800 mb-4">
                                You need to connect a Stripe account to receive payouts for completed sessions.
                            </p>
                        </div>

                        <button
                            onClick={handleConnectStripe}
                            disabled={connecting}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {connecting ? 'Redirecting...' : 'Connect Stripe Account'}
                        </button>

                        <div className="text-xs text-gray-600 space-y-1">
                            <p>• Stripe is a secure payment platform used by millions</p>
                            <p>• You&lsquo;ll be redirected to Stripe to complete setup</p>
                            <p>• Takes about 5 minutes to complete</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {accountStatus.detailsSubmitted ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-900 mb-2">
                                    ✅ Stripe account connected
                                </h3>
                                <div className="text-sm text-green-800 space-y-1">
                                    <p>• Charges enabled: {accountStatus.chargesEnabled ? 'Yes' : 'No'}</p>
                                    <p>• Payouts enabled: {accountStatus.payoutsEnabled ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-900 mb-2">
                                    ⚠️ Complete your Stripe account setup
                                </h3>
                                <p className="text-sm text-yellow-800 mb-4">
                                    Your account is connected but setup is not complete.
                                </p>
                                <button
                                    onClick={handleConnectStripe}
                                    disabled={connecting}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                >
                                    {connecting ? 'Redirecting...' : 'Complete Setup'}
                                </button>
                            </div>
                        )}

                        {accountStatus.payoutsEnabled && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    💡 You&apos;ll receive payouts automatically after customers confirm session completion. Payouts typically arrive in 2-7 business days.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )

}