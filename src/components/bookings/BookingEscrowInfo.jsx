"use client";

import { MdInfo, MdCheckCircle } from "react-icons/md";
import { formatCurrency } from "@/utils/messages";

export default function BookingEscrowInfo({ booking, payment }) {
    if (!payment) return null;

    if (payment.status === "escrowed" && booking.status !== "finalized" && booking.status !== "cancelled") {
        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                    <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                        Your payment is held securely in escrow. The therapist receives their share as you confirm each session.
                    </p>
                </div>
            </div>
        );
    }

    if (payment.status === "partially_released") {
        const totalAmount = parseFloat(payment.amount);
        const platformFee = parseFloat(payment.platformFee ?? 0);
        const releasedAmount = parseFloat(payment.releasedAmount ?? 0);
        const refundedAmount = parseFloat(payment.refundedAmount ?? 0);
        const feeRatio = totalAmount > 0 ? platformFee / totalAmount : 0;
        const grossReleased = feeRatio < 1 ? parseFloat((releasedAmount / (1 - feeRatio)).toFixed(2)) : releasedAmount;
        const stillInEscrow = Math.max(0, parseFloat((totalAmount - grossReleased - refundedAmount).toFixed(2)));

        return (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                    <MdInfo className="text-blue-600 dark:text-blue-400 text-sm mt-0.5 shrink-0" />
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                        <p>{formatCurrency(grossReleased)} paid for confirmed sessions.</p>
                        {refundedAmount > 0 && (
                            <p>{formatCurrency(refundedAmount)} refunded to you for missed/undelivered sessions.</p>
                        )}
                        {stillInEscrow > 0 && (
                            <p>{formatCurrency(stillInEscrow)} held in escrow for upcoming sessions.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (booking.status === "finalized" && payment.refundedAmount) {
        return (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                    <MdCheckCircle className="text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Series finalized. {formatCurrency(parseFloat(payment.refundedAmount))} has been refunded for undelivered sessions.
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
