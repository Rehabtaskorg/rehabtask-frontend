"use client";

import {
    MdPending,
    MdCheckCircle,
    MdPlayCircle,
    MdTaskAlt,
    MdCancel,
    MdUpdate,
} from "react-icons/md";

const STATUS_CONFIG = {
    pending: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-300",
        icon: MdPending,
        label: "Pending Payment",
    },
    confirmed: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-800 dark:text-blue-300",
        icon: MdCheckCircle,
        label: "Confirmed",
    },
    in_progress: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-800 dark:text-purple-300",
        icon: MdPlayCircle,
        label: "In Progress",
    },
    completed: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        icon: MdTaskAlt,
        label: "Completed",
    },
    cancelled: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        icon: MdCancel,
        label: "Cancelled",
    },
    reschedule_requested: {
        bg: "bg-amber-100 dark:bg-amber-900/30",
        text: "text-amber-800 dark:text-amber-300",
        icon: MdUpdate,
        label: "Reschedule Requested",
    },
};

const SIZE_CLASSES = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5",
};

export default function BookingStatusBadge({ status, size = "sm" }) {
    const config = STATUS_CONFIG[status] || {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
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