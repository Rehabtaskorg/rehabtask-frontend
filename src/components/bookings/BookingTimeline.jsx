"use client";

import {
    MdCheckCircle,
    MdRadioButtonUnchecked,
    MdTimer,
    MdCancel,
    MdPayments,
    MdCalendarToday,
    MdTaskAlt,
    MdPersonPin,
    MdAccountBalanceWallet,
    MdReceipt,
} from "react-icons/md";
import { BOOKING_STATUS } from "@/lib/constants";
import { getPendingPaymentDeadline } from "@/lib/bookingPayment";
import { formatClockTime } from "@/utils/dates";

const formatTimestamp = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

function TimelineStep({ icon: Icon, title, subtitle, timestamp, isCompleted, isWaiting, isCancelled, isLast, nextCompleted }) {
    const lineColor = isCompleted && nextCompleted
        ? "border-primary"
        : "border-dashed border-slate-300 ";

    let StatusIcon;
    let statusColor;

    if (isCancelled) {
        StatusIcon = MdCancel;
        statusColor = "text-red-500 ";
    } else if (isCompleted) {
        StatusIcon = MdCheckCircle;
        statusColor = "text-primary";
    } else if (isWaiting) {
        StatusIcon = MdTimer;
        statusColor = "text-amber-500 ";
    } else {
        StatusIcon = MdRadioButtonUnchecked;
        statusColor = "text-slate-300 ";
    }

    return (
        <div className="relative flex gap-3">
            {/* Vertical line + icon column */}
            <div className="flex flex-col items-center shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${statusColor}`}>
                    <StatusIcon className="text-lg" />
                </div>
                {!isLast && (
                    <div className={`flex-1 border-l-2 my-1 min-h-6 ${lineColor}`} />
                )}
            </div>

            {/* Content */}
            <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                <div className="flex items-center gap-2">
                    <Icon className={`text-sm ${isCompleted || isWaiting ? "text-text-main " : "text-text-muted "}`} />
                    <p className={`text-sm font-semibold ${isCancelled ? "text-red-600 " : isCompleted || isWaiting ? "text-text-main " : "text-text-muted "}`}>
                        {title}
                    </p>
                </div>
                {subtitle && (
                    <p className="text-xs text-text-muted  mt-0.5 ml-6">
                        {subtitle}
                    </p>
                )}
                {timestamp && (
                    <p className="text-xs text-text-muted  mt-0.5 ml-6">
                        {formatTimestamp(timestamp)}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function BookingTimeline({ booking }) {
    if (!booking) return null;

    const sessions = booking.sessions || [];
    const session = sessions[0];
    const { payment } = booking;
    const isMultiSession = sessions.length > 1;

    // Missed/cancelled/attempted sessions are out of scope for milestone tracking.
    //   - missed:    full refund, no payout
    //   - cancelled: never delivered
    //   - attempted: partial payout already released, customer already refunded the
    //                remainder. The session is closed and contributes nothing to
    //                the "All Sessions Confirmed" milestone — therapist already
    //                got paid for what they could deliver (the trip).
    const deliverableSessions = sessions.filter(s =>
        s.status !== "missed" && s.status !== "cancelled" && s.status !== "attempted"
    );
    const missedOrCancelledCount = sessions.filter(s => s.status === "missed" || s.status === "cancelled").length;
    const attemptedCount = sessions.filter(s => s.status === "attempted").length;
    const reducedScopeCount = missedOrCancelledCount + attemptedCount;
    const hasReducedScope = reducedScopeCount > 0;
    const reducedScopeLabel = (() => {
        const parts = [];
        if (missedOrCancelledCount > 0) {
            parts.push(`${missedOrCancelledCount} ${sessions.some(s => s.status === "missed") ? "missed" : "cancelled"}`);
        }
        if (attemptedCount > 0) parts.push(`${attemptedCount} attempted`);
        return parts.join(" + ");
    })();

    // For multi-session: aggregate status across all DELIVERABLE sessions
    const allSessionsConfirmed = isMultiSession
        ? deliverableSessions.length > 0 && deliverableSessions.every(s => s.status === "confirmed_by_customer")
        : session?.status === "confirmed_by_customer";
    const anyTherapistComplete = isMultiSession
        ? deliverableSessions.some(s => s.status === "completed_by_therapist")
        : session?.status === "completed_by_therapist";
    const allTherapistComplete = isMultiSession
        ? deliverableSessions.length > 0 && deliverableSessions.every(s => ["completed_by_therapist", "confirmed_by_customer"].includes(s.status))
        : !!session?.completedAt;
    const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;
    const isFinalized = booking.status === BOOKING_STATUS.FINALIZED;

    // Build steps dynamically
    const steps = [];

    // 1. Booking Created - always shown
    steps.push({
        icon: MdReceipt,
        title: "Booking Created",
        timestamp: booking.createdAt,
        isCompleted: true,
    });

    // 2. Payment Escrowed (or awaiting payment)
    if (!payment && [BOOKING_STATUS.PENDING, BOOKING_STATUS.PENDING_PAYMENT, BOOKING_STATUS.ACCEPTED].includes(booking.status)) {
        const holdUntil = formatClockTime(getPendingPaymentDeadline(booking));
        steps.push({
            icon: MdPayments,
            title: "Awaiting Payment",
            subtitle: holdUntil ? `Slot held until ${holdUntil}` : null,
            isWaiting: true,
        });
    } else if (payment) {
        const escrowed = ["escrowed", "partially_released", "released", "refunded"].includes(payment.status);
        const failed = payment.status === "failed";
        steps.push({
            icon: MdPayments,
            title: failed ? "Payment Failed" : escrowed ? "Payment Secured in Escrow" : "Awaiting Payment",
            subtitle: escrowed ? "Funds held securely until session completion" : null,
            timestamp: payment.escrowedAt,
            isCompleted: escrowed,
            isWaiting: payment.status === "intent_created",
            isCancelled: failed,
        });
    }

    // 3. Session Scheduled
    if (session) {
        steps.push({
            icon: MdCalendarToday,
            title: "Session Scheduled",
            timestamp: session.scheduledDate,
            isCompleted: true,
        });
    }

    // Cancelled shortcut
    if (isCancelled) {
        steps.push({
            icon: MdCancel,
            title: "Booking Cancelled",
            subtitle: session?.cancellationReason || null,
            timestamp: null,
            isCompleted: false,
            isCancelled: true,
        });

        if (payment?.status === "refunded") {
            steps.push({
                icon: MdAccountBalanceWallet,
                title: "Payment Credited",
                timestamp: payment.releasedAt,
                isCompleted: true,
            });
        }
    } else {
        // 4. Therapist Marked complete (counted against deliverable sessions only)
        if (session) {
            const therapistDone = isMultiSession ? allTherapistComplete : !!session.completedAt;
            const therapistTimestamp = isMultiSession
                ? (allTherapistComplete ? deliverableSessions.filter(s => s.completedAt).pop()?.completedAt : null)
                : session.completedAt;
            const completedCount = deliverableSessions.filter(s => ["completed_by_therapist", "confirmed_by_customer"].includes(s.status)).length;
            const deliverableCount = deliverableSessions.length;
            steps.push({
                icon: MdTaskAlt,
                title: isMultiSession ? "All Sessions Completed by Therapist" : "Therapist Marked Complete",
                subtitle: isMultiSession
                    ? (anyTherapistComplete && !allTherapistComplete
                        ? `${completedCount} of ${deliverableCount} deliverable sessions completed${hasReducedScope ? ` (${reducedScopeLabel})` : ""}`
                        : (hasReducedScope && allTherapistComplete
                            ? `${deliverableCount} deliverable session${deliverableCount !== 1 ? "s" : ""} completed (${reducedScopeLabel}, excluded)`
                            : null))
                    : null,
                timestamp: therapistTimestamp,
                isCompleted: therapistDone,
                isWaiting: !therapistDone && ["confirmed", "in_progress"].includes(booking.status),
            });
        }

        // 5. Customer Confirmed (counted against deliverable sessions only)
        if (session) {
            const customerDone = isMultiSession ? allSessionsConfirmed : !!session.confirmedByCustomerAt;
            const customerTimestamp = isMultiSession
                ? (allSessionsConfirmed ? deliverableSessions.filter(s => s.confirmedByCustomerAt).pop()?.confirmedByCustomerAt : null)
                : session.confirmedByCustomerAt;
            const waiting = isMultiSession
                ? (anyTherapistComplete && !allSessionsConfirmed)
                : session.status === "completed_by_therapist";
            const confirmedCount = deliverableSessions.filter(s => s.status === "confirmed_by_customer").length;
            const deliverableCount = deliverableSessions.length;
            steps.push({
                icon: MdPersonPin,
                title: isMultiSession ? "All Sessions Confirmed" : "Customer Confirmed Completion",
                subtitle: isMultiSession
                    ? (waiting
                        ? `${confirmedCount} of ${deliverableCount} deliverable session${deliverableCount !== 1 ? "s" : ""} confirmed${hasReducedScope ? ` (${reducedScopeLabel})` : ""}`
                        : (hasReducedScope && customerDone
                            ? `All ${deliverableCount} deliverable session${deliverableCount !== 1 ? "s" : ""} confirmed (${reducedScopeLabel}, excluded)`
                            : null))
                    : (waiting ? "Awaiting customer confirmation" : null),
                timestamp: customerTimestamp,
                isCompleted: customerDone,
                isWaiting: waiting,
            });
        }

        // 6. Payment Released / Finalized / Partially Released
        if (payment && !isCancelled) {
            const released = payment.status === "released";
            // When a booking is finalized early (not every deliverable confirmed), the
            // "Payment Released" milestone changes character — it's the partial payout
            // plus the remaining sessions being refunded to the customer.
            const title = isFinalized
                ? "Booking Finalized"
                : "Payment Released";
            const subtitle = isFinalized
                ? `Therapist paid for delivered sessions, customer credited for remaining`
                : (hasReducedScope && released
                    ? `Paid out for ${deliverableSessions.filter(s => s.status === "confirmed_by_customer").length} deliverable session${deliverableSessions.filter(s => s.status === "confirmed_by_customer").length !== 1 ? "s" : ""} (${reducedScopeLabel}, credited separately)`
                    : null);
            steps.push({
                icon: MdAccountBalanceWallet,
                title,
                subtitle,
                timestamp: payment.releasedAt,
                isCompleted: released || isFinalized,
            });
        }
    }

    // Tag each step with nextCompleted for line styling
    const taggedSteps = steps.map((step, i) => ({
        ...step,
        isLast: i === steps.length - 1,
        nextCompleted: i < steps.length - 1 ? steps[i + 1].isCompleted : false,
    }));

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-main  mb-4">
                Booking Timeline
            </h3>
            <div>
                {taggedSteps.map((step, i) => (
                    <TimelineStep key={i} {...step} />
                ))}
            </div>
        </div>
    )

}