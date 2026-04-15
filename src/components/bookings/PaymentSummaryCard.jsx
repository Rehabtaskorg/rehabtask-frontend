"use client";

import { MdPayments, MdLock, MdCheckCircle, MdError, MdRefresh, MdArrowForward } from "react-icons/md";
import { formatCurrency } from "@/utils/messages";
import { resolveVisitPlan, computeTotalVisits } from "@/lib/visitPlan";

// Labels are role-aware. Therapists see accounting terms (they map to the
// earnings dashboard); customers see plain-language status of their money.
const PAYMENT_STATUS_CONFIG = {
    intent_created: {
        icon: MdRefresh,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        label: { therapist: "Processing", customer: "Processing" },
    },
    escrowed: {
        icon: MdLock,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        label: { therapist: "Held in Escrow", customer: "Payment Secured" },
    },
    partially_released: {
        icon: MdLock,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        label: { therapist: "Partially Released", customer: "Payment Active" },
    },
    released: {
        icon: MdCheckCircle,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        label: { therapist: "Released", customer: "Payment Complete" },
    },
    refunded: {
        icon: MdRefresh,
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-50 dark:bg-slate-800",
        label: { therapist: "Refunded", customer: "Refunded" },
    },
    failed: {
        icon: MdError,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-900/20",
        label: { therapist: "Failed", customer: "Payment Failed" },
    },
}

export default function PaymentSummaryCard({ booking, role, onAction }) {
    if (!booking) return null;

    const perSessionRate = parseFloat(booking.rate);
    const payment = booking.payment;
    const sessions = booking.sessions || [];
    const session = sessions[0];
    // Effective plan: booking (authoritative) > offer override > request.
    // Legacy bookings have NULL override columns and fall through to request values.
    const plan = resolveVisitPlan({ booking, offer: booking.offer, request: booking.offer?.request });
    const totalSessionsFromFreq = computeTotalVisits(plan) ?? 1;
    const totalSessions = sessions.length > 1 ? sessions.length : totalSessionsFromFreq;
    const isMultiSession = totalSessions > 1;
    const totalAmount = payment ? parseFloat(payment.amount) : perSessionRate * totalSessions;
    const isCustomer = role === "customer";
    const isTherapist = role === "therapist";

    const isFinalized = booking.status === "finalized";
    const fullPlatformFee = payment ? parseFloat(payment.platformFee) : null;
    const fullPayout = payment ? parseFloat(payment.therapistPayout) : null;
    const releasedAmount = payment?.releasedAmount ? parseFloat(payment.releasedAmount) : null;
    const isPartialRelease = payment?.status === "partially_released";

    // Deliverable sessions = the ones still capable of generating a payout.
    // Missed and cancelled sessions are removed from the equation (already refunded).
    // For multi-session bookings: per-session rate is fixed, so payout shrinks linearly.
    const missedOrCancelledCount = sessions.filter(s => s.status === "missed" || s.status === "cancelled").length;
    const deliverableSessionCount = Math.max(0, totalSessions - missedOrCancelledCount);
    const hasReducedScope = missedOrCancelledCount > 0 && payment && totalSessions > 0;

    // Recalculate the achievable totals after refunds for missed/cancelled sessions.
    // Per-session math = (originalTotal / originalSessions) × deliverableSessions
    const effectivePayout = hasReducedScope && fullPayout != null
        ? parseFloat(((fullPayout / totalSessions) * deliverableSessionCount).toFixed(2))
        : fullPayout;
    const effectivePlatformFee = hasReducedScope && fullPlatformFee != null
        ? parseFloat(((fullPlatformFee / totalSessions) * deliverableSessionCount).toFixed(2))
        : fullPlatformFee;
    const effectiveTotalAmount = hasReducedScope
        ? parseFloat(((totalAmount / totalSessions) * deliverableSessionCount).toFixed(2))
        : totalAmount;

    // For finalized bookings, show actual released amounts (not the full plan totals)
    const platformFee = isFinalized && releasedAmount !== null && fullPayout > 0
        ? parseFloat((fullPlatformFee * (releasedAmount / fullPayout)).toFixed(2))
        : effectivePlatformFee;
    const payout = isFinalized && releasedAmount !== null
        ? releasedAmount
        : effectivePayout;

    const paymentConfig = payment ? PAYMENT_STATUS_CONFIG[payment.status] : null;
    const PaymentIcon = paymentConfig?.icon || MdPayments;

    // Determine CTA — only "Pay Now" lives here. Mark Complete and Confirm Completion
    // are in the main content area where their confirmation dialogs appear.
    let ctaLabel = null;
    let ctaAction = null;
    let ctaColor = "bg-primary hover:bg-primary/90";

    if (isCustomer && ["pending", "accepted"].includes(booking.status) && !payment) {
        ctaLabel = "Pay Now";
        ctaAction = "proceed_payment";
    }

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2">
                    <MdPayments className="text-primary text-lg" />
                    <h3 className="text-sm font-bold text-text-main dark:text-white">
                        Payment Summary
                    </h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
                {/* Rate */}
                {isMultiSession ? (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted dark:text-gray-400">Rate per Session</span>
                            <span className="text-sm font-medium text-text-main dark:text-white">
                                {formatCurrency(perSessionRate)} × {totalSessions} sessions
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-text-main dark:text-white">Total Amount</span>
                            <span className="text-sm font-bold text-text-main dark:text-white">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                        {hasReducedScope && (
                            <div className="flex items-center justify-between text-xs text-text-muted dark:text-gray-400">
                                <span>{missedOrCancelledCount} session{missedOrCancelledCount > 1 ? "s" : ""} {sessions.some(s => s.status === "missed") ? "missed" : "cancelled"}</span>
                                <span>-{formatCurrency(totalAmount - effectiveTotalAmount)}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted dark:text-gray-400">Session Rate</span>
                        <span className="text-sm font-semibold text-text-main dark:text-white">
                            {formatCurrency(perSessionRate)}
                        </span>
                    </div>
                )}

                {/* Therapist view: show fee breakdown */}
                {isTherapist && payment && (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted dark:text-gray-400">Platform Fee</span>
                            <span className="text-sm font-medium text-red-500 dark:text-red-400">
                                -{formatCurrency(platformFee)}
                            </span>
                        </div>
                        <div className="border-t border-border-light dark:border-border-dark pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-text-main dark:text-white">
                                    {hasReducedScope ? "Max Earnings" : "Your Earnings"}
                                </span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(payout)}
                                </span>
                            </div>
                            {hasReducedScope && (
                                <p className="text-[11px] text-text-muted dark:text-gray-400 mt-0.5">
                                    Adjusted for {missedOrCancelledCount} {sessions.some(s => s.status === "missed") ? "missed" : "cancelled"} session{missedOrCancelledCount > 1 ? "s" : ""}
                                </p>
                            )}
                            {isPartialRelease && releasedAmount !== null && (
                                <div className="mt-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
                                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
                                        Released so far: {formatCurrency(releasedAmount)} of {formatCurrency(payout)}
                                    </p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                                        Remaining {formatCurrency(Math.max(0, payout - releasedAmount))} held in escrow
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
                {isTherapist && !payment && (
                    <div className="border-t border-border-light dark:border-border-dark pt-3">
                        <p className="text-xs text-text-muted dark:text-gray-400">
                            Commission applied at payment
                        </p>
                    </div>
                )}

                {/* Customer view: total */}
                {isCustomer && !isMultiSession && (
                    <div className="border-t border-border-light dark:border-border-dark pt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-main dark:text-white">Total</span>
                        <span className="text-lg font-bold text-primary dark:text-blue-400">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                )}

                {/* Payment status */}
                {paymentConfig && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${paymentConfig.bg}`}>
                        <PaymentIcon className={`text-base ${paymentConfig.color}`} />
                        <span className={`text-xs font-semibold ${paymentConfig.color}`}>
                            {paymentConfig.label?.[role] || paymentConfig.label?.therapist || "—"}
                        </span>
                    </div>
                )}
            </div>

            {/* CTA */}
            {ctaLabel && onAction && (
                <div className="px-5 pb-5">
                    <button
                        onClick={() => onAction(ctaAction)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition-colors ${ctaColor}`}
                    >
                        <MdArrowForward className="text-base" />
                        {ctaLabel}
                    </button>
                </div>
            )}
        </div>
    );
}