"use client";

import { useRouter } from "next/navigation";
import { MdStars, MdWarning, MdAccessTime } from "react-icons/md";
import { useSubscription } from "@/hooks/useSubscription";

/**
 * Displays the customer's current subscription state in the dashboard sidebar.
 * Renders a contextual CTA for trial, grace period, free, or active paid plans.
 */
export function SubscriptionWidget() {
    const { subscription } = useSubscription();
    const router = useRouter();

    const status = subscription?.status;
    const plan = subscription?.planType || "free";
    const isTrial = status === "trialing";
    const isGrace = status === "grace_period";
    const isFree = plan === "free" && !isTrial;

    const trialDays = isTrial && subscription?.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
        : 0;

    if (isTrial) {
        return (
            <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                        <MdAccessTime className="text-xl" />
                        <h5 className="font-bold text-lg">Free Trial — {trialDays} day{trialDays !== 1 ? "s" : ""} left</h5>
                    </div>
                    <p className="text-white/70 text-sm">Upgrade before your trial ends to keep your Pro plan features.</p>
                    <button
                        onClick={() => router.push("/customer/subscription")}
                        className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors"
                    >
                        View Plans
                    </button>
                </div>
                <div className="absolute -bottom-8 -right-8 size-32 bg-white/10 rounded-full pointer-events-none" />
            </div>
        );
    }

    if (isGrace) {
        return (
            <div className="bg-amber-500 p-6 rounded-xl text-white relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                        <MdWarning className="text-xl" />
                        <h5 className="font-bold text-lg">Payment Overdue</h5>
                    </div>
                    <p className="text-white/80 text-sm">Update your payment method to avoid being downgraded to Free.</p>
                    <button
                        onClick={() => router.push("/customer/subscription")}
                        className="bg-white text-amber-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors"
                    >
                        Update Payment
                    </button>
                </div>
            </div>
        );
    }

    if (isFree) {
        return (
            <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                        <MdStars className="text-xl" />
                        <h5 className="font-bold text-lg">Free Plan</h5>
                    </div>
                    <p className="text-white/70 text-sm">Upgrade to unlock more visits, job postings, and priority matching.</p>
                    <button
                        onClick={() => router.push("/customer/subscription")}
                        className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors"
                    >
                        Upgrade Plan
                    </button>
                </div>
                <div className="absolute -bottom-8 -right-8 size-32 bg-white/10 rounded-full pointer-events-none" />
            </div>
        );
    }

    return (
        <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden">
            <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                    <MdStars className="text-xl" />
                    <h5 className="font-bold text-lg">
                        {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                    </h5>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20">Active</span>
                </div>
                <p className="text-white/70 text-sm">Your subscription is active. Manage your plan and billing settings.</p>
                <button
                    onClick={() => router.push("/customer/subscription")}
                    className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors"
                >
                    Manage Subscription
                </button>
            </div>
            <div className="absolute -bottom-8 -right-8 size-32 bg-white/10 rounded-full pointer-events-none" />
        </div>
    );
}
