"use client";

import {
    MdPending,
    MdCheckCircle,
    MdPlayCircle,
    MdTaskAlt,
    MdCancel,
    MdUpdate,
    MdPayment,
    MdWarning,
    MdTimer,
} from "react-icons/md";

const STATUS_CONFIG = {
    pending: {
        bg: "bg-amber-100 ",
        text: "text-amber-800 ",
        icon: MdPending,
        label: "Pending Payment",
    },
    pending_payment: {
        bg: "bg-orange-100 ",
        text: "text-orange-800 ",
        icon: MdTimer,
        label: "Payment Required",
    },
    accepted: {
        bg: "bg-teal-100 ",
        text: "text-teal-800 ",
        icon: MdPayment,
        label: "Accepted — Awaiting Payment",
    },
    confirmed: {
        bg: "bg-blue-100 ",
        text: "text-blue-800 ",
        icon: MdCheckCircle,
        label: "Confirmed",
    },
    in_progress: {
        bg: "bg-purple-100 ",
        text: "text-purple-800 ",
        icon: MdPlayCircle,
        label: "In Progress",
    },
    completed: {
        bg: "bg-emerald-100 ",
        text: "text-emerald-700 ",
        icon: MdTaskAlt,
        label: "Completed",
    },
    cancelled: {
        bg: "bg-red-100 ",
        text: "text-red-700 ",
        icon: MdCancel,
        label: "Cancelled",
    },
    reschedule_requested: {
        bg: "bg-amber-100 ",
        text: "text-amber-800 ",
        icon: MdUpdate,
        label: "Reschedule Requested",
    },
    finalized: {
        bg: "bg-slate-100 ",
        text: "text-slate-700 ",
        icon: MdTaskAlt,
        label: "Finalized",
    },
    cancellation_requested: {
        bg: "bg-yellow-100 ",
        text: "text-yellow-800 ",
        icon: MdWarning,
        label: "Action Required",
    },
};

const SIZE_CLASSES = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5",
};

export default function BookingStatusBadge({ status, size = "sm" }) {
    const config = STATUS_CONFIG[status] || {
        bg: "bg-slate-100 ",
        text: "text-slate-600 ",
        icon: MdPending,
        label: status?.replace(/_/g, " ").toUpperCase() || "Unknown",
    };

    const Icon = config.icon;
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

    return (
        <span className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full whitespace-nowrap shrink-0 ${config.bg} ${config.text} ${sizeClass}`}>
            <Icon className={size === "sm" ? "text-xs" : "text-sm"} />
            {config.label}
        </span>
    );
}