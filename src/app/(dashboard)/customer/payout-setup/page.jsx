"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MdArrowBack, MdLock, MdCheckCircle, MdError, MdAccountBalance, MdBolt, MdAutorenew, MdShield } from "react-icons/md";
import { ConnectAccountOnboarding } from "@stripe/react-connect-js";
import { paymentsApi } from "@/services/payment.api";
import { useRefundSummary, useCustomerConnectStatus } from "@/hooks/usePayments";
import StripeConnectProvider from "@/components/stripe/StripeConnectProvider";
import { CustomerPayoutStructureStep } from "@/components/customer/payouts/CustomerPayoutStructureStep";
import { usePageTitle } from "@/hooks/usePageTitle";
import { showToast } from "@/lib/toast";
import { logger } from "@/lib/logger";
import { useQueryClient } from "@tanstack/react-query";

const STATUS = {
    INITIALIZING: "initializing",
    IDLE: "idle",
    STRUCTURE: "structure",
    CREATING: "creating",
    ONBOARDING: "onboarding",
    VERIFYING: "verifying",
    COMPLETE: "complete",
    ERROR: "error",
};

const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0.00" : `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function PayoutSetupPage() {
    usePageTitle("Payout Account Setup");
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: summary } = useRefundSummary();
    const { data: connectStatus } = useCustomerConnectStatus();

    const [status, setStatus] = useState(STATUS.INITIALIZING);
    const [error, setError] = useState(null);
    const [stripeLoadError, setStripeLoadError] = useState(null);
    const [embeddedFormLoaded, setEmbeddedFormLoaded] = useState(false);

    const pendingAmount = summary?.pendingRefundAmount || 0;

    useEffect(() => {
        if (connectStatus === undefined) return;

        /* eslint-disable react-hooks/set-state-in-effect */
        if (connectStatus?.connected && connectStatus?.onboardingComplete && !connectStatus?.hasUpcomingRequirements && !connectStatus?.currentlyDueCount && !connectStatus?.pastDueCount) {
            setStatus(STATUS.COMPLETE);
        } else if (connectStatus?.connected) {
            // Show the embedded onboarding component when there are any requirements
            // (past_due, currently_due, or upcoming eventually_due) — the component
            // surfaces exactly what Stripe needs with collectionOptions: eventually_due.
            setStatus(STATUS.ONBOARDING);
        } else {
            setStatus(STATUS.IDLE);
        }
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [connectStatus]);

    const handleShowStructureStep = () => setStatus(STATUS.STRUCTURE);

    const handleCreateAccount = async (businessStructure) => {
        setStatus(STATUS.CREATING);
        setError(null);
        try {
            await paymentsApi.createCustomerConnectAccount({ businessStructure });
            setStatus(STATUS.ONBOARDING);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to set up your payout account. Please try again.");
            setStatus(STATUS.ERROR);
        }
    };

    const handleOnboardingExit = useCallback(async () => {
        setStatus(STATUS.VERIFYING);
        setError(null);

        try {
            const res = await paymentsApi.getCustomerConnectStatus();
            const data = res.data.data;

            if (data.connected && data.detailsSubmitted && data.payoutsEnabled) {
                setStatus(STATUS.COMPLETE);
                queryClient.invalidateQueries({ queryKey: ["customer-connect-status"] });
                queryClient.invalidateQueries({ queryKey: ["customer-refund-summary"] });
                showToast.success("Payout account connected! Pending credits will be processed shortly.");
                setTimeout(() => router.push("/customer/payments"), 2000);
            } else if (data.connected && data.detailsSubmitted) {
                showToast.info("Your details have been submitted. We are verifying your account.");
                queryClient.invalidateQueries({ queryKey: ["customer-connect-status"] });
                setTimeout(() => router.push("/customer/payments"), 2000);
                setStatus(STATUS.COMPLETE);
            } else {
                setStatus(STATUS.ONBOARDING);
                setError("Your payout setup is incomplete. Please fill in all required fields to continue.");
            }
        } catch (err) {
            setStatus(STATUS.ONBOARDING);
            setError("Could not verify your account status. Please try again or refresh the page.");
        }
    }, [queryClient, router]);

    const handleStripeLoadError = useCallback((err) => {
        logger.error("[CustomerPayoutSetup] SDK load error:", err);
        setStripeLoadError("Failed to load the payout setup module. Please check your connection and refresh the page.");
    }, []);

    const handleEmbeddedFormStart = useCallback(() => {
        setEmbeddedFormLoaded(true);
    }, []);

    const handleRetry = () => {
        setError(null);
        setStripeLoadError(null);
        setEmbeddedFormLoaded(false);
        setStatus(connectStatus?.connected ? STATUS.ONBOARDING : STATUS.STRUCTURE);
    };

    const isOnboardingStep = status === STATUS.ONBOARDING;

    return (
        <div className="flex-1 overflow-auto bg-background-light  py-8 px-4">
            <div className={isOnboardingStep ? "max-w-4xl mx-auto" : "max-w-2xl mx-auto"}>
                {/* Back link */}
                <Link
                    href="/customer/payments"
                    className="flex items-center gap-1.5 text-text-muted  hover:text-primary text-sm font-medium mb-6 transition-colors"
                >
                    <MdArrowBack className="text-base" />
                    Back to Payments
                </Link>

                {/* INITIALIZING */}
                {status === STATUS.INITIALIZING && (
                    <div className="bg-card-light  border border-border-light  rounded-xl p-12 flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        <p className="text-text-muted  text-sm">Loading payout setup...</p>
                    </div>
                )}

                {/* IDLE */}
                {status === STATUS.IDLE && (
                    <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm overflow-hidden">
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MdAccountBalance className="text-primary text-4xl" />
                            </div>
                            <h1 className="text-xl font-bold text-text-main  mb-2">
                                Set Up Your Payout Account
                            </h1>
                            <p className="text-text-muted  text-sm max-w-md mx-auto leading-relaxed">
                                Connect your bank account to receive account credits directly. This is a one-time setup — all future credits will be deposited automatically.
                            </p>
                        </div>

                        {/* Pending refund context */}
                        {pendingAmount > 0 && (
                            <div className="mx-8 mb-6 bg-primary/5  border border-primary/20 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-lg font-bold text-text-main ">{formatCurrency(pendingAmount)} in pending credits</span>
                                </div>
                                <p className="text-xs text-text-muted  leading-relaxed">
                                    Once your account is verified, these funds will be processed automatically within 2-3 business days.
                                </p>
                            </div>
                        )}

                        <div className="px-8 pb-8">
                            <div className="bg-muted-light  rounded-lg p-5 border border-border-light  mb-6">
                                <p className="text-sm font-semibold text-text-main  mb-3">What you will need:</p>
                                {[
                                    "Bank account or debit card for direct deposits",
                                    "Government-issued photo ID",
                                    "Social Security Number (SSN) or EIN",
                                    "About 5-10 minutes",
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3 mb-2 last:mb-0">
                                        <MdCheckCircle className="text-primary text-sm shrink-0 mt-0.5" />
                                        <span className="text-sm text-text-muted ">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleShowStructureStep}
                                className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <MdAccountBalance className="text-lg" />
                                Set Up Payout Account
                            </button>

                            <Link
                                href="/customer/payments"
                                className="block w-full text-center text-text-muted  hover:text-text-main  mt-3 py-2 text-sm font-semibold transition-colors"
                            >
                                Skip for now
                            </Link>

                            <div className="flex items-center gap-2 text-text-muted  text-xs mt-4 justify-center">
                                <MdLock className="text-sm shrink-0" />
                                <span>All financial data is encrypted and processed securely. RehabTask never stores your bank details.</span>
                            </div>
                        </div>

                        {/* Info footer */}
                        <div className="grid grid-cols-3 border-t border-border-light ">
                            <div className="p-5 text-center border-r border-border-light ">
                                <MdShield className="text-primary text-lg mx-auto mb-1" />
                                <p className="text-xs font-bold text-text-main ">Secure</p>
                                <p className="text-[10px] text-text-muted ">Bank-level encryption</p>
                            </div>
                            <div className="p-5 text-center border-r border-border-light ">
                                <MdBolt className="text-primary text-lg mx-auto mb-1" />
                                <p className="text-xs font-bold text-text-main ">Fast</p>
                                <p className="text-[10px] text-text-muted ">2-3 business days</p>
                            </div>
                            <div className="p-5 text-center">
                                <MdAutorenew className="text-primary text-lg mx-auto mb-1" />
                                <p className="text-xs font-bold text-text-main ">Automatic</p>
                                <p className="text-[10px] text-text-muted ">No manual requests</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STRUCTURE — business structure pre-screen */}
                {status === STATUS.STRUCTURE && (
                    <CustomerPayoutStructureStep onConfirm={handleCreateAccount} />
                )}

                {/* CREATING */}
                {status === STATUS.CREATING && (
                    <div className="bg-card-light  border border-border-light  rounded-xl p-12 flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        <p className="text-text-main  font-semibold">Setting up your payout account...</p>
                        <p className="text-text-muted  text-sm">This only takes a moment.</p>
                    </div>
                )}

                {/* ONBOARDING — Embedded Stripe form */}
                {status === STATUS.ONBOARDING && (
                    <div className="space-y-4">
                        {error && (
                            <div className="flex items-start gap-3 bg-amber-50  border border-amber-200  rounded-xl p-4">
                                <MdError className="text-amber-500 text-xl shrink-0 mt-0.5" />
                                <p className="text-amber-700  text-sm">{error}</p>
                            </div>
                        )}

                        {stripeLoadError ? (
                            <div className="bg-card-light  border border-border-light  rounded-xl p-8 text-center space-y-4">
                                <MdError className="text-red-500 text-4xl mx-auto" />
                                <p className="text-text-main  font-semibold">Failed to load payout setup</p>
                                <p className="text-text-muted  text-sm">{stripeLoadError}</p>
                                <button onClick={handleRetry} className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">
                                    Try again
                                </button>
                            </div>
                        ) : (
                            <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6 md:p-8">
                                {!embeddedFormLoaded && (
                                    <div className="animate-pulse space-y-5">
                                        <div className="h-6 w-48 bg-slate-200  rounded" />
                                        <div className="space-y-3 pt-2">
                                            <div className="h-4 w-32 bg-slate-200  rounded" />
                                            <div className="h-11 w-full bg-slate-100  rounded-lg" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-4 w-40 bg-slate-200  rounded" />
                                            <div className="h-11 w-full bg-slate-100  rounded-lg" />
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <div className="h-10 w-28 bg-slate-200  rounded-lg" />
                                        </div>
                                    </div>
                                )}
                                <div className={embeddedFormLoaded ? "" : "hidden"}>
                                    <StripeConnectProvider accountSessionEndpoint="/payments/customer-connect/account-session">
                                        <ConnectAccountOnboarding
                                            onExit={handleOnboardingExit}
                                            onLoadError={handleStripeLoadError}
                                            onLoaderStart={handleEmbeddedFormStart}
                                            collectionOptions={{
                                                fields: 'eventually_due',
                                                futureRequirements: 'include',
                                            }}
                                        />
                                    </StripeConnectProvider>
                                </div>
                            </div>
                        )}

                        <div className="text-center">
                            <Link
                                href="/customer/payments"
                                className="text-text-muted  hover:text-text-main  text-sm font-semibold transition-colors"
                            >
                                I will finish this later
                            </Link>
                        </div>
                    </div>
                )}

                {/* VERIFYING */}
                {status === STATUS.VERIFYING && (
                    <div className="bg-card-light  border border-border-light  rounded-xl p-12 flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                        <p className="text-text-main  font-semibold">Verifying your account...</p>
                        <p className="text-text-muted  text-sm">Just a moment while we confirm everything is in order.</p>
                    </div>
                )}

                {/* COMPLETE */}
                {status === STATUS.COMPLETE && (
                    <div className="bg-card-light  border border-border-light  rounded-xl p-12 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-emerald-100  rounded-full flex items-center justify-center">
                            <MdCheckCircle className="text-emerald-500 text-4xl" />
                        </div>
                        <p className="text-text-main  font-bold text-xl">Payout Account Connected!</p>
                        <p className="text-text-muted  text-sm text-center max-w-sm">
                            {pendingAmount > 0
                                ? `Your pending credit of ${formatCurrency(pendingAmount)} is being processed and will arrive in 2-3 business days.`
                                : "Future credits will be deposited directly to your bank account."
                            }
                        </p>
                        <Link
                            href="/customer/payments"
                            className="mt-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors"
                        >
                            View Payments
                        </Link>
                    </div>
                )}

                {/* ERROR */}
                {status === STATUS.ERROR && (
                    <div className="bg-card-light  border border-border-light  rounded-xl p-8 space-y-5">
                        <div className="flex items-start gap-3 bg-red-50  border border-red-200  rounded-xl p-4">
                            <MdError className="text-red-500 text-xl shrink-0 mt-0.5" />
                            <p className="text-red-700  text-sm">{error}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={handleRetry} className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-bold transition-colors">
                                Try again
                            </button>
                            <Link href="/customer/payments" className="w-full text-center text-text-muted  hover:text-text-main  px-8 py-3 rounded-lg font-semibold transition-colors">
                                Back to Payments
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
