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

const formatTimestamp = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
};

function TimelineStep({ icon: Icon, iconColor, title, subtitle, timestamp, isCompleted, isWaiting, isCancelled, isLast, nextCompleted }) {
    const lineColor = isCompleted && nextCompleted
        ? "border-primary"
        : "border-dashed border-slate-300 dark:border-slate-600";

    let StatusIcon;
    let statusColor;

    if (isCancelled) {
        StatusIcon = MdCancel;
        statusColor = "text-red-500 dark:text-red-400";
    } else if (isCompleted) {
        StatusIcon = MdCheckCircle;
        statusColor = "text-primary";
    } else if (isWaiting) {
        StatusIcon = MdTimer;
        statusColor = "text-amber-500 dark:text-amber-400";
    } else {
        StatusIcon = MdRadioButtonUnchecked;
        statusColor = "text-slate-300 dark:text-slate-600";
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
                    <Icon className={`text-sm ${isCompleted || isWaiting ? "text-text-main dark:text-white" : "text-text-muted dark:text-gray-500"}`} />
                    <p className={`text-sm font-semibold ${isCancelled ? "text-red-600 dark:text-red-400" : isCompleted || isWaiting ? "text-text-main dark:text-white" : "text-text-muted dark:text-gray-500"}`}>
                        {title}
                    </p>
                </div>
                {subtitle && (
                    <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5 ml-6">
                        {subtitle}
                    </p>
                )}
                {timestamp && (
                    <p className="text-xs text-text-muted dark:text-gray-500 mt-0.5 ml-6">
                        {formatTimestamp(timestamp)}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function BookingTimeline({ booking }) {
    if (!booking) return null;

    const { session, payment } = booking;
    const isCancelled = booking.status === "cancelled";

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
    if (!payment && ["pending", "accepted"].includes(booking.status)) {
        steps.push({
            icon: MdPayments,
            title: "Awaiting Payment",
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
                title: "Payment Refunded",
                timestamp: payment.releasedAt,
                isCompleted: true,
            });
        }
    } else {
        // 4. Therapist Marked complete
        if (session) {
            const therapistDone = !!session.completedAt;
            steps.push({
                icon: MdTaskAlt,
                title: "Therapist Marked Complete",
                timestamp: session.completedAt,
                isCompleted: therapistDone,
                isWaiting: !therapistDone && booking.status === "confirmed",
            });
        }

        // 5. Customer Confirmed
        if (session) {
            const customerDone = !!session.confirmedByCustomerAt;
            const waiting = session.status === "completed_by_therapist";
            steps.push({
                icon: MdPersonPin,
                title: "Customer Confirmed Completion",
                subtitle: waiting ? "Awaiting customer confirmation" : null,
                timestamp: session.confirmedByCustomerAt,
                isCompleted: customerDone,
                isWaiting: waiting,
            });
        }

        // 6. Payment Released
        if (payment && !isCancelled) {
            const released = payment.status === "released";
            steps.push({
                icon: MdAccountBalanceWallet,
                title: "Payment Released",
                timestamp: payment.releasedAt,
                isCompleted: released,
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
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
            <h3 className="text-sm font-bold text-text-main dark:text-white mb-4">
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