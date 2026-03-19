"use client";

import { MdPayments, MdLock, MdCheckCircle, MdError, MdRefresh, MdArrowForward, MdTaskAlt, } from "react-icons/md";
import { formatCurrency } from "@/utils/messages";

const PAYMENT_STATUS_CONFIG = {
    intent_created: {
        icon: MdRefresh,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        label: "Processing",
    },
    escrowed: {
        icon: MdLock,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        label: "Held in Escrow",
    },
    partially_released: {
        icon: MdLock,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        label: "Partially Released",
    },
    released: {
        icon: MdCheckCircle,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        label: "Released",
    },
    refunded: {
        icon: MdRefresh,
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-50 dark:bg-slate-800",
        label: "Refunded",
    },
    failed: {
        icon: MdError,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-900/20",
        label: "Failed",
    },
}

export default function PaymentSummaryCard({ booking, role, onAction }) {
    if (!booking) return null;

    const rate = parseFloat(booking.rate);
    const payment = booking.payment;
    const session = booking.session;
    const isCustomer = role === "customer";
    const isTherapist = role === "therapist";

    const platformFee = payment ? parseFloat(payment.platformFee) : null;
    const payout = payment ? parseFloat(payment.therapistPayout) : null;
    const releasedAmount = payment?.releasedAmount ? parseFloat(payment.releasedAmount) : null;
    const isPartialRelease = payment?.status === "partially_released";

    const paymentConfig = payment ? PAYMENT_STATUS_CONFIG[payment.status] : null;
    const PaymentIcon = paymentConfig?.icon || MdPayments;

    // Determine CTA
    let ctaLabel = null;
    let ctaAction = null;
    let ctaColor = "bg-primary hover:bg-primary/90";

    if (isCustomer && ["pending", "accepted"].includes(booking.status) && !payment) {
        ctaLabel = "Pay Now";
        ctaAction = "proceed_payment";
    } else if (isCustomer && session?.status === "completed_by_therapist") {
        ctaLabel = "Confirm Completion";
        ctaAction = "confirm_completion";
        ctaColor = "bg-emerald-500 hover:bg-emerald-600";
    } else if (isTherapist && booking.status === "confirmed" && session?.status === "scheduled") {
        ctaLabel = "Mark Session Complete";
        ctaAction = "mark_complete";
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
                {/* Session rate */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted dark:text-gray-400">Session Rate</span>
                    <span className="text-sm font-semibold text-text-main dark:text-white">
                        {formatCurrency(rate)}
                    </span>
                </div>

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
                                <span className="text-sm font-semibold text-text-main dark:text-white">Your Earnings</span>
                                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(payout)}
                                </span>
                            </div>
                            {isPartialRelease && releasedAmount !== null && (
                                <div className="mt-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-3 py-2">
                                    <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
                                        Released so far: {formatCurrency(releasedAmount)} of {formatCurrency(payout)}
                                    </p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                                        Remaining {formatCurrency(payout - releasedAmount)} held by admin
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
                {isCustomer && (
                    <div className="border-t border-border-light dark:border-border-dark pt-3 flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-main dark:text-white">Total</span>
                        <span className="text-lg font-bold text-primary dark:text-blue-400">
                            {formatCurrency(rate)}
                        </span>
                    </div>
                )}

                {/* Payment status */}
                {paymentConfig && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${paymentConfig.bg}`}>
                        <PaymentIcon className={`text-base ${paymentConfig.color}`} />
                        <span className={`text-xs font-semibold ${paymentConfig.color}`}>
                            {paymentConfig.label}
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
                        {ctaAction === "confirm_completion" ? (
                            <MdTaskAlt className="text-base" />
                        ) : ctaAction === "mark_complete" ? (
                            <MdCheckCircle className="text-base" />
                        ) : (
                            <MdArrowForward className="text-base" />
                        )}
                        {ctaLabel}
                    </button>
                </div>
            )}
        </div>
    );
}