"use client";

import { useState } from "react";
import { MdStars, MdCheckCircle, MdRocketLaunch, MdCreditCard, MdCancel, MdWarning, MdAccessTime } from "react-icons/md";
import { useSubscription, useCreateCheckout, useCreateBillingPortal, useCancelSubscription } from "@/hooks/useSubscription";
import { usePageTitle } from "@/hooks/usePageTitle";

const PLANS = [
    {
        key: "free",
        name: "Free",
        monthlyPrice: 0,
        annualPrice: 0,
        requestLimit: 5,
        therapistLimit: 5,
        features: ["5 active requests", "5 active therapist bookings", "Basic support"],
    },
    {
        key: "standard",
        name: "Standard",
        monthlyPrice: 49,
        annualPrice: 530,
        requestLimit: 10,
        therapistLimit: 10,
        features: ["10 active requests", "10 active therapist bookings", "Priority support"],
        popular: true,
    },
    {
        key: "premium",
        name: "Premium",
        monthlyPrice: 129,
        annualPrice: 1071,
        requestLimit: null,
        therapistLimit: null,
        features: ["Unlimited requests", "Unlimited therapist bookings", "Filter Elite therapists", "Dedicated coordinator", "Premium support"],
    },
];

const STATUS_BADGES = {
    active: { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    trialing: { label: "Free Trial", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    grace_period: { label: "Grace Period", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    past_due: { label: "Past Due", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
    inactive: { label: "Inactive", className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
};

function UsageBar({ label, current, limit }) {
    const isUnlimited = limit === null || limit >= 999999;
    const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
    const isAtLimit = !isUnlimited && current >= limit;

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-text-muted dark:text-slate-400">{label}</span>
                <span className={`font-medium ${isAtLimit ? "text-red-500" : "text-text-main dark:text-white"}`}>
                    {isUnlimited ? `${current} used` : `${current}/${limit}`}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                        className={`h-full rounded-full transition-all ${isAtLimit ? "bg-red-500" : "bg-primary"}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
            {isUnlimited && (
                <div className="h-2 rounded-full bg-primary/20">
                    <div className="h-full rounded-full bg-primary w-full opacity-30" />
                </div>
            )}
        </div>
    );
}

export default function SubscriptionPage() {
    usePageTitle("Subscription");
    const { subscription, usage, loading } = useSubscription();
    const checkout = useCreateCheckout();
    const billingPortal = useCreateBillingPortal();
    const cancelSub = useCancelSubscription();
    const [billingInterval, setBillingInterval] = useState("monthly");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [upgradingPlan, setUpgradingPlan] = useState(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const currentPlan = subscription?.planType || "free";
    const status = subscription?.status || "active";
    const badge = STATUS_BADGES[status] || STATUS_BADGES.inactive;
    const isPaid = subscription?.stripeSubscriptionId != null;
    const isTrial = status === "trialing";
    const isGracePeriod = status === "grace_period";

    const trialDaysLeft = isTrial && subscription?.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const graceDaysLeft = isGracePeriod && subscription?.gracePeriodEndsAt
        ? Math.max(0, Math.ceil((new Date(subscription.gracePeriodEndsAt) - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    const handleUpgrade = (planType) => {
        setUpgradingPlan(planType);
        checkout.mutate({ planType, billingInterval }, {
            onError: () => setUpgradingPlan(null),
        });
    };

    return (
        <div className="py-6 px-4 max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-text-main dark:text-white">Subscription</h1>
                <p className="text-text-muted dark:text-slate-400 mt-1">Manage your plan and billing</p>
            </div>

            {/* Status Banners */}
            {isTrial && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <MdAccessTime className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                        <p className="font-semibold text-blue-700 dark:text-blue-400">Free Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining</p>
                        <p className="text-sm text-blue-600 dark:text-blue-300">You have Standard plan access. Upgrade before your trial ends to keep your features.</p>
                    </div>
                </div>
            )}

            {isGracePeriod && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <MdWarning className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                        <p className="font-semibold text-amber-700 dark:text-amber-400">Payment Overdue — {graceDaysLeft} day{graceDaysLeft !== 1 ? "s" : ""} before downgrade</p>
                        <p className="text-sm text-amber-600 dark:text-amber-300">Please update your payment method to avoid losing your plan features.</p>
                    </div>
                </div>
            )}

            {/* Current Plan Card */}
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <MdStars className="w-6 h-6 text-primary" />
                        <div>
                            <h2 className="font-bold text-lg text-text-main dark:text-white">
                                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                            </h2>
                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
                                {badge.label}
                            </span>
                        </div>
                    </div>
                    {isPaid && !isGracePeriod && !subscription?.cancelledAt && subscription?.currentPeriodEnd && (
                        <div className="text-right text-sm text-text-muted dark:text-slate-400">
                            <p>Next billing date</p>
                            <p className="font-semibold text-text-main dark:text-white">
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UsageBar label="Active Requests" current={usage.activeRequests} limit={subscription?.requestLimit >= 999999 ? null : subscription?.requestLimit} />
                    <UsageBar label="Active Therapists" current={usage.activeTherapists} limit={subscription?.therapistLimit >= 999999 ? null : subscription?.therapistLimit} />
                </div>
            </div>

            {/* Plan Cards */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-text-main dark:text-white">Choose a Plan</h2>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setBillingInterval("monthly")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${billingInterval === "monthly" ? "bg-white dark:bg-card-dark text-text-main dark:text-white shadow-sm" : "text-text-muted dark:text-slate-400"}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval("annual")}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${billingInterval === "annual" ? "bg-white dark:bg-card-dark text-text-main dark:text-white shadow-sm" : "text-text-muted dark:text-slate-400"}`}
                        >
                            Annual
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {PLANS.map((plan) => {
                        // During trial or grace period, no plan is "current" — user needs to (re)subscribe
                        // For free users (non-trial), Free card is current
                        // For paid users, their paid plan card is current
                        const isCurrentPlan = !isTrial && !isGracePeriod && plan.key === currentPlan && (plan.key === "free" || isPaid);
                        const price = billingInterval === "monthly" ? plan.monthlyPrice : plan.annualPrice;
                        const monthlyEquiv = billingInterval === "annual" && plan.annualPrice > 0
                            ? (plan.annualPrice / 12).toFixed(0)
                            : null;
                        const annualSavings = plan.monthlyPrice > 0
                            ? (plan.monthlyPrice * 12) - plan.annualPrice
                            : 0;

                        return (
                            <div
                                key={plan.key}
                                className={`relative flex flex-col rounded-xl border p-6 transition-all ${isCurrentPlan
                                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                                    : "border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark"
                                    } ${plan.popular && !isCurrentPlan ? "ring-2 ring-primary/30" : ""}`}
                            >
                                {plan.popular && !isCurrentPlan && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                                        Popular
                                    </span>
                                )}
                                {isCurrentPlan && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                        Current Plan
                                    </span>
                                )}

                                <h3 className="text-lg font-bold text-text-main dark:text-white">{plan.name}</h3>
                                <div className="mt-3 mb-4 min-h-15">
                                    {price === 0 ? (
                                        <span className="text-3xl font-bold text-text-main dark:text-white">Free</span>
                                    ) : (
                                        <div>
                                            <span className="text-3xl font-bold text-text-main dark:text-white">
                                                ${billingInterval === "monthly" ? price : monthlyEquiv}
                                            </span>
                                            <span className="text-text-muted dark:text-slate-400">/mo</span>
                                            {billingInterval === "annual" && (
                                                <p className="text-sm text-text-muted dark:text-slate-400 mt-1">
                                                    ${price}/year
                                                    {annualSavings > 0 && (
                                                        <span className="text-green-500 font-semibold ml-1">Save ${annualSavings}/yr</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-2 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-text-main dark:text-slate-200">
                                            <MdCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6">
                                    {isCurrentPlan ? (
                                        <button disabled className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-text-muted dark:text-slate-400 font-medium cursor-default">
                                            Current Plan
                                        </button>
                                    ) : plan.key === "free" ? (
                                        <button disabled className="w-full py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-text-muted dark:text-slate-400 font-medium cursor-default">
                                            Free Plan
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUpgrade(plan.key)}
                                            disabled={upgradingPlan !== null}
                                            className="w-full py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {upgradingPlan === plan.key ? "Redirecting..." : `Upgrade to ${plan.name}`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Billing Management — hide during grace period (subscription already cancelled in Stripe) */}
            {isPaid && !isGracePeriod && (
                <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm">
                    <h2 className="font-bold text-lg text-text-main dark:text-white mb-4 flex items-center gap-2">
                        <MdCreditCard className="w-5 h-5 text-text-muted dark:text-slate-400" />
                        Billing Management
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => billingPortal.mutate()}
                            disabled={billingPortal.isPending}
                            className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                        >
                            {billingPortal.isPending ? "Opening..." : "Manage Billing"}
                        </button>
                        {!subscription?.cancelledAt && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="px-4 py-2 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Cancel Subscription
                            </button>
                        )}
                        {subscription?.cancelledAt && (
                            <p className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                                <MdWarning className="w-4 h-4" />
                                Cancellation scheduled — active until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <MdCancel className="w-8 h-8 text-red-500" />
                            <h3 className="text-lg font-bold text-text-main dark:text-white">Cancel Subscription</h3>
                        </div>
                        <p className="text-text-muted dark:text-slate-400 mb-2">Are you sure you want to cancel your subscription?</p>
                        <p className="text-sm text-text-muted dark:text-slate-400 mb-6">
                            You&apos;ll keep access until the end of your current billing period
                            {subscription?.currentPeriodEnd && (
                                <> ({new Date(subscription.currentPeriodEnd).toLocaleDateString()})</>
                            )}. After that, your plan will be downgraded to Free.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-main dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                Keep Plan
                            </button>
                            <button
                                onClick={() => {
                                    cancelSub.mutate();
                                    setShowCancelModal(false);
                                }}
                                disabled={cancelSub.isPending}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                            >
                                {cancelSub.isPending ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}