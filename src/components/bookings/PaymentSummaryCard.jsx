"use client";

import { MdPayments, MdLock, MdCheckCircle, MdError, MdRefresh, MdArrowForward } from "react-icons/md";
import { formatCurrency } from "@/utils/messages";
import { resolveVisitPlan, computeTotalVisits } from "@/lib/visitPlan";

// Labels are role-aware. Therapists see accounting terms (they map to the
// earnings dashboard); customers see plain-language status of their money.
const PAYMENT_STATUS_CONFIG = {
    intent_created: {
        icon: MdRefresh,
        color: "text-amber-600 ",
        bg: "bg-amber-50 ",
        label: { therapist: "Processing", customer: "Processing" },
    },
    escrowed: {
        icon: MdLock,
        color: "text-blue-600 ",
        bg: "bg-blue-50 ",
        label: { therapist: "Held in Escrow", customer: "Payment Secured" },
    },
    partially_released: {
        icon: MdLock,
        color: "text-orange-600 ",
        bg: "bg-orange-50 ",
        label: { therapist: "Partially Released", customer: "Payment Active" },
    },
    released: {
        icon: MdCheckCircle,
        color: "text-emerald-600 ",
        bg: "bg-emerald-50 ",
        label: { therapist: "Released", customer: "Payment Complete" },
    },
    refunded: {
        icon: MdRefresh,
        color: "text-slate-600 ",
        bg: "bg-slate-50 ",
        label: { therapist: "Refunded", customer: "Refunded" },
    },
    failed: {
        icon: MdError,
        color: "text-red-600 ",
        bg: "bg-red-50 ",
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

    
    const missedOrCancelledCount = sessions.filter(s => s.status === "missed" || s.status === "cancelled").length;
    const attemptedSessions = sessions.filter(s => s.status === "attempted");
    const attemptedRevenue = attemptedSessions.reduce(
        (sum, s) => sum + (s.attemptedRateCharged != null ? parseFloat(s.attemptedRateCharged) : 0),
        0
    );
    
    
    const perSessionValue = totalSessions > 0 ? totalAmount / totalSessions : 0;
    const lossFromMissedCancelled = missedOrCancelledCount * perSessionValue;
    const lossFromAttempted = attemptedSessions.reduce(
        (sum) => sum + perSessionValue,
        0
    ) - attemptedRevenue;
    const totalDiscount = parseFloat((lossFromMissedCancelled + Math.max(0, lossFromAttempted)).toFixed(2));
    const hasReducedScope = totalDiscount > 0 && payment && totalSessions > 0;

    // Effective totals are the original minus the proportional loss. Commission
    // proportions match the original ratio so the therapist's net stays fair.
    const feeRatio = totalAmount > 0 && fullPlatformFee != null ? fullPlatformFee / totalAmount : 0;
    const effectiveTotalAmount = hasReducedScope
        ? parseFloat((totalAmount - totalDiscount).toFixed(2))
        : totalAmount;
    const effectivePlatformFee = hasReducedScope && fullPlatformFee != null
        ? parseFloat((effectiveTotalAmount * feeRatio).toFixed(2))
        : fullPlatformFee;
    const effectivePayout = hasReducedScope && fullPayout != null
        ? parseFloat((effectiveTotalAmount - effectivePlatformFee).toFixed(2))
        : fullPayout;

    // For finalized bookings, show actual released amounts (not the full plan totals)
    const platformFee = isFinalized && releasedAmount !== null && fullPayout > 0
        ? parseFloat((fullPlatformFee * (releasedAmount / fullPayout)).toFixed(2))
        : effectivePlatformFee;
    const payout = isFinalized && releasedAmount !== null
        ? releasedAmount
        : effectivePayout;

    // When the booking is finalized but payment stayed escrowed (all sessions missed,
    // no therapist transfer), show "Refunded" instead of "Held in Escrow" / "Payment Secured".
    const effectivePaymentStatus = (isFinalized && payment?.status === "escrowed")
        ? "refunded"
        : payment?.status;
    const paymentConfig = payment ? PAYMENT_STATUS_CONFIG[effectivePaymentStatus] : null;
    const PaymentIcon = paymentConfig?.icon || MdPayments;

    // Determine CTA — only "Pay Now" lives here. Mark Complete and Confirm Completion
    // are in the main content area where their confirmation dialogs appear.
    let ctaLabel = null;
    let ctaAction = null;
    let ctaColor = "bg-primary hover:bg-primary/90";

    if (isCustomer && ["pending", "accepted"].includes(booking.status) && (!payment || payment.status === "failed")) {
        ctaLabel = payment?.status === "failed" ? "Retry Payment" : "Pay Now";
        ctaAction = "proceed_payment";
        if (payment?.status === "failed") ctaColor = "bg-red-600 hover:bg-red-700";
    }

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border-light ">
                <div className="flex items-center gap-2">
                    <MdPayments className="text-primary text-lg" />
                    <h3 className="text-sm font-bold text-text-main ">
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
                            <span className="text-sm text-text-muted ">Rate per Session</span>
                            <span className="text-sm font-medium text-text-main ">
                                {formatCurrency(perSessionRate)} × {totalSessions} sessions
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-text-main ">Total Amount</span>
                            <span className="text-sm font-bold text-text-main ">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                        {hasReducedScope && (
                            <div className="flex items-center justify-between text-xs text-text-muted ">
                                <span>
                                    {(() => {
                                        const parts = [];
                                        if (missedOrCancelledCount > 0) {
                                            const label = sessions.some(s => s.status === "missed") ? "missed" : "cancelled";
                                            parts.push(`${missedOrCancelledCount} ${label}`);
                                        }
                                        if (attemptedSessions.length > 0) {
                                            parts.push(`${attemptedSessions.length} attempted`);
                                        }
                                        return `${parts.join(" + ")} session${(missedOrCancelledCount + attemptedSessions.length) > 1 ? "s" : ""}`;
                                    })()}
                                </span>
                                <span>-{formatCurrency(totalAmount - effectiveTotalAmount)}</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-text-muted ">Session Rate</span>
                        <span className="text-sm font-semibold text-text-main ">
                            {formatCurrency(perSessionRate)}
                        </span>
                    </div>
                )}

                {/* Therapist view: show fee breakdown */}
                {isTherapist && payment && (
                    <>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted ">Platform Fee</span>
                            <span className="text-sm font-medium text-red-500 ">
                                -{formatCurrency(platformFee)}
                            </span>
                        </div>
                        <div className="border-t border-border-light  pt-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-text-main ">
                                    {hasReducedScope ? "Max Earnings" : "Your Earnings"}
                                </span>
                                <span className="text-lg font-bold text-emerald-600 ">
                                    {formatCurrency(payout)}
                                </span>
                            </div>
                            {hasReducedScope && (
                                <p className="text-[11px] text-text-muted  mt-0.5">
                                    Adjusted for {(() => {
                                        const parts = [];
                                        if (missedOrCancelledCount > 0) {
                                            parts.push(`${missedOrCancelledCount} ${sessions.some(s => s.status === "missed") ? "missed" : "cancelled"}`);
                                        }
                                        if (attemptedSessions.length > 0) {
                                            parts.push(`${attemptedSessions.length} attempted`);
                                        }
                                        return `${parts.join(" + ")} session${(missedOrCancelledCount + attemptedSessions.length) > 1 ? "s" : ""}`;
                                    })()}
                                </p>
                            )}
                            {isPartialRelease && releasedAmount !== null && (
                                <div className="mt-2 bg-orange-50  border border-orange-200  rounded-lg px-3 py-2">
                                    <p className="text-xs font-medium text-orange-700 ">
                                        Released so far: {formatCurrency(releasedAmount)} of {formatCurrency(payout)}
                                    </p>
                                    <p className="text-xs text-orange-600  mt-0.5">
                                        Remaining {formatCurrency(Math.max(0, payout - releasedAmount))} held in escrow
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
                {isTherapist && !payment && (
                    <div className="border-t border-border-light  pt-3">
                        <p className="text-xs text-text-muted ">
                            Commission applied at payment
                        </p>
                    </div>
                )}

                {/* Customer view: total */}
                {isCustomer && !isMultiSession && (
                    <div className="border-t border-border-light  pt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-main ">Total</span>
                        <span className="text-lg font-bold text-primary ">
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