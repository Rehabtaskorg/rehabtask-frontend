"use client";

import { useState, useEffect } from "react";
import { MdStars, MdCheckCircle, MdCreditCard, MdCancel, MdWarning, MdAccessTime, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import { useSubscription, useCreateCheckout, useCreateBillingPortal, useCancelSubscription, useResumeSubscription, useUpgradeSubscription, useDowngradeSubscription, useCancelScheduledDowngrade } from "@/hooks/useSubscription";
import { subscriptionApi } from "@/services/subscription.api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAnalytics } from "@/hooks/useAnalytics";
import { PLAN_TYPES } from "@/lib/constants";
import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { CustomerLockedPageOverlay } from "@/components/customer/CustomerLockedPageOverlay";

const PLANS = [
    {
        key: PLAN_TYPES.FREE,
        name: "Free",
        monthlyPrice: 0,
        visitLimit: 10,
        jobPostingLimit: 5,
        rank: 0,
        features: ["10 visits/month", "5 active job postings", "Unlimited messaging", "Standard matching", "Email notifications"],
    },
    {
        key: PLAN_TYPES.PRO,
        name: "Pro",
        monthlyPrice: 249,
        visitLimit: 150,
        jobPostingLimit: null,
        rank: 1,
        features: ["150 visits/month", "Unlimited job postings", "Priority matching", "Credential reminders", "Analytics dashboard"],
        popular: true,
    },
    {
        key: PLAN_TYPES.ENTERPRISE,
        name: "Enterprise",
        monthlyPrice: 799,
        visitLimit: 500,
        jobPostingLimit: null,
        rank: 2,
        features: ["500 visits/month", "Unlimited job postings", "Multi-branch support", "Priority matching", "Analytics dashboard"],
    },
    {
        key: PLAN_TYPES.UNLIMITED,
        name: "Unlimited",
        monthlyPrice: 1499,
        visitLimit: null,
        jobPostingLimit: null,
        rank: 3,
        features: ["Unlimited visits", "Unlimited job postings", "Priority matching", "Dedicated coordinator", "Analytics dashboard"],
    },
];

const STATUS_BADGES = {
    active:       { label: "Active",       className: "bg-green-100 text-green-700" },
    trialing:     { label: "Free Trial",   className: "bg-blue-100 text-blue-700" },
    grace_period: { label: "Grace Period", className: "bg-amber-100 text-amber-700" },
    past_due:     { label: "Past Due",     className: "bg-red-100 text-red-700" },
    cancelled:    { label: "Cancelled",    className: "bg-gray-100 text-gray-700" },
    inactive:     { label: "Inactive",     className: "bg-gray-100 text-gray-700" },
};

/**
 * @param {{ label: string, current: number, limit: number|null }} props
 */
function UsageBar({ label, current, limit, tooltip }) {
    const isUnlimited = limit === null || limit >= 999999;
    const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
    const isAtLimit = !isUnlimited && current >= limit;

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1 text-text-muted">
                    {label}
                    {tooltip && (
                        <span className="group relative inline-flex">
                            <svg className="h-3.5 w-3.5 text-text-muted opacity-60 cursor-default" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                {tooltip}
                            </span>
                        </span>
                    )}
                </span>
                <span className={`font-medium ${isAtLimit ? "text-red-500" : "text-text-main"}`}>
                    {isUnlimited ? `${current} used · Unlimited` : `${current} / ${limit}`}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-2 rounded-full bg-gray-200">
                    <div
                        className={`h-full rounded-full transition-all ${isAtLimit ? "bg-red-500" : "bg-primary"}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            )}
        </div>
    );
}

export default function SubscriptionPage() {
    const customer = useCustomerUser();
    if (!customer?.canAccessMarketplace) {
        return <CustomerLockedPageOverlay pageType="subscription" />;
    }
    return <SubscriptionPageContent />;
}

function SubscriptionPageContent() {
    usePageTitle("Subscription");
    const { trackEvent } = useAnalytics();
    const { subscription, usage, loading } = useSubscription();
    const checkout = useCreateCheckout();
    const billingPortal = useCreateBillingPortal();
    const cancelSub = useCancelSubscription();
    const upgradeMutation = useUpgradeSubscription();
    const downgradeMutation = useDowngradeSubscription();
    const cancelDowngradeMutation = useCancelScheduledDowngrade();
    const resumeMutation = useResumeSubscription();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(null);
    const [showDowngradeModal, setShowDowngradeModal] = useState(null);
    const [upgradingPlan, setUpgradingPlan] = useState(null);
    const [upgradePreview, setUpgradePreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [upgradeError, setUpgradeError] = useState(null);

    useEffect(() => {
        if (!loading) {
            trackEvent("subscription_page_viewed", { current_plan: subscription?.planType ?? PLAN_TYPES.FREE });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const currentPlan = subscription?.planType || PLAN_TYPES.FREE;
    const status = subscription?.status || "active";
    const badge = STATUS_BADGES[status] || STATUS_BADGES.inactive;
    const isPaid = subscription?.stripeSubscriptionId != null;
    const isTrial = status === "trialing";
    const isGracePeriod = status === "grace_period";
    const isCancelledButActive = status === "active" && !!subscription?.cancelledAt;

    const trialDaysLeft = isTrial && subscription?.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;

    const graceDaysLeft = isGracePeriod && subscription?.gracePeriodEndsAt
        ? Math.max(0, Math.ceil((new Date(subscription.gracePeriodEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;

    const currentPlanRank = PLANS.find(p => p.key === currentPlan)?.rank ?? 0;
    const pendingDowngrade = subscription?.stripeScheduleId ? (subscription.scheduledDowngradePlan ?? true) : null;

    const handlePlanAction = (targetPlan) => {
        const targetRank = PLANS.find(p => p.key === targetPlan)?.rank ?? 0;

        trackEvent("subscription_upgrade_clicked", { target_plan: targetPlan });

        if (!isPaid || isTrial || isGracePeriod) {
            setUpgradingPlan(targetPlan);
            checkout.mutate({ planType: targetPlan }, { onError: () => setUpgradingPlan(null) });
            return;
        }

        if (targetRank > currentPlanRank) {
            setShowUpgradeModal(targetPlan);
            setUpgradePreview(null);
            setUpgradeError(null);
            setPreviewLoading(true);
            subscriptionApi.previewUpgrade({ planType: targetPlan })
                .then(res => setUpgradePreview(res.data.data))
                .catch(() => setUpgradePreview(null))
                .finally(() => setPreviewLoading(false));
            return;
        }

        if (targetRank < currentPlanRank && targetPlan !== PLAN_TYPES.FREE) {
            setShowDowngradeModal(targetPlan);
        }
    };

    const confirmUpgrade = () => {
        const targetPlan = showUpgradeModal;
        setUpgradeError(null);
        setUpgradingPlan(targetPlan);
        upgradeMutation.mutate({ planType: targetPlan }, {
            onSuccess: () => {
                setShowUpgradeModal(null);
                setUpgradePreview(null);
                setUpgradingPlan(null);
            },
            onError: (error) => {
                setUpgradingPlan(null);
                setUpgradeError(error?.response?.data?.message || "Upgrade failed. Please try again.");
            },
        });
    };

    const confirmDowngrade = () => {
        const targetPlan = showDowngradeModal;
        setShowDowngradeModal(null);
        setUpgradingPlan(targetPlan);
        downgradeMutation.mutate({ planType: targetPlan }, {
            onSettled: () => setUpgradingPlan(null),
        });
    };

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto w-full">
            <div>
                <h1 className="text-2xl font-bold text-text-main">Subscription</h1>
                <p className="text-text-muted mt-1">Manage your plan and billing</p>
            </div>

            {isTrial && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <MdAccessTime className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                        <p className="font-semibold text-blue-700">Free Trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} remaining</p>
                        <p className="text-sm text-blue-600">You have Pro plan access. Upgrade before your trial ends to keep your features.</p>
                    </div>
                </div>
            )}

            {pendingDowngrade && !isGracePeriod && (
                <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-3">
                        <MdArrowDownward className="w-6 h-6 text-amber-500 shrink-0" />
                        <div>
                            <p className="font-semibold text-amber-700">
                                {typeof pendingDowngrade === "string"
                                    ? `Downgrade to ${pendingDowngrade.charAt(0).toUpperCase() + pendingDowngrade.slice(1)} scheduled`
                                    : "Plan downgrade scheduled"}
                            </p>
                            <p className="text-sm text-amber-600">
                                Your current plan stays active until{" "}
                                {subscription?.currentPeriodEnd
                                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                                    : "the end of your billing period"}.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => cancelDowngradeMutation.mutate()}
                        disabled={cancelDowngradeMutation.isPending}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
                    >
                        {cancelDowngradeMutation.isPending ? "Cancelling..." : "Cancel Downgrade"}
                    </button>
                </div>
            )}

            {isGracePeriod && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <MdWarning className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                        <p className="font-semibold text-amber-700">Payment Overdue — {graceDaysLeft} day{graceDaysLeft !== 1 ? "s" : ""} before downgrade</p>
                        <p className="text-sm text-amber-600">Please update your payment method to avoid losing your plan features.</p>
                    </div>
                </div>
            )}

            {isCancelledButActive && (
                <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                    <div className="flex items-center gap-3">
                        <MdCancel className="w-6 h-6 text-red-500 shrink-0" />
                        <div>
                            <p className="font-semibold text-red-700">Cancellation Scheduled</p>
                            <p className="text-sm text-red-600">
                                Your plan will end on{" "}
                                {subscription?.currentPeriodEnd
                                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                                    : "the end of your billing period"}. You&apos;ll keep full access until then.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => resumeMutation.mutate()}
                        disabled={resumeMutation.isPending}
                        className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
                    >
                        {resumeMutation.isPending ? "Resuming..." : "Resume Plan"}
                    </button>
                </div>
            )}

            {/* Current Plan Card */}
            <div className="bg-card-light rounded-xl border border-border-light p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <MdStars className="w-6 h-6 text-primary" />
                        <div>
                            <h2 className="font-bold text-lg text-text-main">
                                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                            </h2>
                            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.className}`}>
                                {badge.label}
                            </span>
                        </div>
                    </div>
                    {isPaid && !isGracePeriod && subscription?.currentPeriodEnd && (
                        <div className="text-right text-sm text-text-muted">
                            <p>{isCancelledButActive ? "Plan ends on" : "Next billing date"}</p>
                            <p className={`font-semibold ${isCancelledButActive ? "text-red-500" : "text-text-main"}`}>
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UsageBar
                        label="Visits this billing period"
                        current={usage.sessionsUsed}
                        limit={subscription?.visitLimit >= 999999 ? null : subscription?.visitLimit}
                        tooltip="Sessions are counted when you accept a therapist offer. Cancelled sessions are deducted."
                    />
                    <UsageBar
                        label="Active job postings"
                        current={usage.activeJobPostings}
                        limit={subscription?.jobPostingLimit >= 999999 ? null : subscription?.jobPostingLimit}
                    />
                </div>
            </div>

            {/* Plan Cards */}
            <div>
                <h2 className="text-lg font-bold text-text-main mb-6">Choose a Plan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {PLANS.map((plan) => {
                        const isCurrentPlan = !isTrial && !isGracePeriod && plan.key === currentPlan && (plan.key === PLAN_TYPES.FREE || isPaid);

                        return (
                            <div
                                key={plan.key}
                                className={`relative flex flex-col rounded-xl border p-6 transition-all ${
                                    isCurrentPlan
                                        ? "border-primary bg-primary/5"
                                        : "border-border-light bg-card-light"
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

                                <h3 className="text-lg font-bold text-text-main">{plan.name}</h3>
                                <div className="mt-3 mb-4">
                                    {plan.monthlyPrice === 0 ? (
                                        <span className="text-3xl font-bold text-text-main">Free</span>
                                    ) : (
                                        <div>
                                            <span className="text-3xl font-bold text-text-main">${plan.monthlyPrice}</span>
                                            <span className="text-text-muted">/mo</span>
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-2 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2 text-sm text-text-main">
                                            <MdCheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6">
                                    {isCurrentPlan ? (
                                        <button disabled className="w-full min-h-[42px] py-2.5 px-3 rounded-lg bg-gray-100 text-text-muted font-medium cursor-default text-sm">
                                            Current Plan
                                        </button>
                                    ) : plan.key === PLAN_TYPES.FREE ? (
                                        <button disabled className="w-full min-h-[42px] py-2.5 px-3 rounded-lg bg-gray-100 text-text-muted font-medium cursor-default text-sm">
                                            Free Plan
                                        </button>
                                    ) : plan.rank > currentPlanRank || !isPaid || isTrial || isGracePeriod ? (
                                        <button
                                            onClick={() => handlePlanAction(plan.key)}
                                            disabled={upgradingPlan !== null}
                                            className="w-full min-h-[42px] py-2.5 px-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-center text-sm"
                                        >
                                            {upgradingPlan === plan.key ? (isPaid ? "Upgrading..." : "Redirecting...") : (
                                                <>
                                                    <MdArrowUpward className="w-4 h-4" />
                                                    Upgrade to {plan.name}
                                                </>
                                            )}
                                        </button>
                                    ) : plan.rank < currentPlanRank && isPaid ? (
                                        <button
                                            onClick={() => handlePlanAction(plan.key)}
                                            disabled={upgradingPlan !== null || (!!pendingDowngrade && (pendingDowngrade === plan.key || pendingDowngrade === true))}
                                            className="w-full min-h-[42px] py-2.5 px-3 rounded-lg border border-amber-300 text-amber-600 font-medium hover:bg-amber-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-center text-sm"
                                        >
                                            {(pendingDowngrade === plan.key || (pendingDowngrade === true && plan.rank < currentPlanRank)) ? (
                                                "Downgrade scheduled"
                                            ) : upgradingPlan === plan.key ? (
                                                "Processing..."
                                            ) : (
                                                <>
                                                    <MdArrowDownward className="w-4 h-4" />
                                                    Downgrade to {plan.name}
                                                </>
                                            )}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Billing Management */}
            {isPaid && !isGracePeriod && (
                <div className="bg-card-light rounded-xl border border-border-light p-6 shadow-sm">
                    <h2 className="font-bold text-lg text-text-main mb-4 flex items-center gap-2">
                        <MdCreditCard className="w-5 h-5 text-text-muted" />
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
                                className="px-4 py-2 rounded-lg border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors"
                            >
                                Cancel Subscription
                            </button>
                        )}
                        {subscription?.cancelledAt && (
                            <p className="flex items-center gap-2 text-sm text-amber-600">
                                <MdWarning className="w-4 h-4" />
                                Cancellation scheduled — active until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (() => {
                const targetPlan = PLANS.find(p => p.key === showUpgradeModal);
                return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card-light rounded-xl p-6 max-w-md w-full shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <MdArrowUpward className="w-8 h-8 text-primary" />
                                <h3 className="text-lg font-bold text-text-main">Upgrade to {targetPlan?.name}</h3>
                            </div>

                            {previewLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="ml-3 text-sm text-text-muted">Calculating proration...</span>
                                </div>
                            )}

                            {!previewLoading && upgradePreview && (
                                <>
                                    <div className="bg-card-light rounded-lg border border-border-light p-4 mb-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">Credit for unused {PLANS.find(p => p.key === currentPlan)?.name}</span>
                                            <span className="text-green-600 font-medium">-${upgradePreview.credit.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text-muted">{targetPlan?.name} for remaining period</span>
                                            <span className="text-text-main font-medium">${upgradePreview.charge.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-border-light pt-2 flex justify-between">
                                            <span className="font-bold text-text-main">Charge today</span>
                                            <span className="font-bold text-primary text-lg">${upgradePreview.netAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-muted mb-2">
                                        Starting next cycle: <strong className="text-text-main">${targetPlan?.monthlyPrice}/mo</strong>
                                    </p>
                                </>
                            )}

                            {!previewLoading && !upgradePreview && !upgradeError && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-700">
                                        A prorated amount will be charged for the remainder of this billing period. Starting next cycle: <strong>${targetPlan?.monthlyPrice}/mo</strong>
                                    </p>
                                </div>
                            )}

                            {upgradeError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-start gap-2">
                                        <MdWarning className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-red-700">{upgradeError}</p>
                                            <button
                                                onClick={() => billingPortal.mutate()}
                                                className="text-sm text-primary hover:underline mt-2 font-medium"
                                            >
                                                Update payment method →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!upgradeError && (
                                <p className="text-sm text-green-600 mb-6 flex items-center gap-2">
                                    <MdCheckCircle className="w-4 h-4" />
                                    {targetPlan?.name} features available immediately
                                </p>
                            )}

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setShowUpgradeModal(null); setUpgradePreview(null); setUpgradeError(null); }}
                                    className="px-4 py-2 rounded-lg border border-border-light text-text-main font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                {!upgradeError && (
                                    <button
                                        onClick={confirmUpgrade}
                                        disabled={upgradeMutation.isPending || previewLoading}
                                        className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {upgradeMutation.isPending
                                            ? "Upgrading..."
                                            : upgradePreview
                                                ? `Confirm & Pay $${upgradePreview.netAmount.toFixed(2)}`
                                                : "Confirm Upgrade"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Downgrade Modal */}
            {showDowngradeModal && (() => {
                const targetPlan = PLANS.find(p => p.key === showDowngradeModal);
                return (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-card-light rounded-xl p-6 max-w-md w-full shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <MdArrowDownward className="w-8 h-8 text-amber-500" />
                                <h3 className="text-lg font-bold text-text-main">Downgrade to {targetPlan?.name}</h3>
                            </div>
                            <p className="text-text-muted mb-2">
                                Your current plan features will remain active until the end of your billing period
                                {subscription?.currentPeriodEnd && (
                                    <> ({new Date(subscription.currentPeriodEnd).toLocaleDateString()})</>
                                )}.
                            </p>
                            <div className="bg-amber-50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-amber-700">After that, your plan will switch to {targetPlan?.name} with:</p>
                                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                                    {targetPlan?.features.map(f => (
                                        <li key={f} className="flex items-center gap-2">
                                            <MdCheckCircle className="w-3 h-3 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDowngradeModal(null)}
                                    className="px-4 py-2 rounded-lg border border-border-light text-text-main font-medium hover:bg-gray-50"
                                >
                                    Keep Current Plan
                                </button>
                                <button
                                    onClick={confirmDowngrade}
                                    disabled={downgradeMutation.isPending}
                                    className="px-4 py-2 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
                                >
                                    {downgradeMutation.isPending ? "Processing..." : "Confirm Downgrade"}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card-light rounded-xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <MdCancel className="w-8 h-8 text-red-500" />
                            <h3 className="text-lg font-bold text-text-main">Cancel Subscription</h3>
                        </div>
                        <p className="text-text-muted mb-2">Are you sure you want to cancel your subscription?</p>
                        <p className="text-sm text-text-muted mb-6">
                            You&apos;ll keep access until the end of your current billing period
                            {subscription?.currentPeriodEnd && (
                                <> ({new Date(subscription.currentPeriodEnd).toLocaleDateString()})</>
                            )}. After that, your plan will be downgraded to Free.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 rounded-lg border border-border-light text-text-main font-medium hover:bg-gray-50"
                            >
                                Keep Plan
                            </button>
                            <button
                                onClick={() => { cancelSub.mutate(); setShowCancelModal(false); }}
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