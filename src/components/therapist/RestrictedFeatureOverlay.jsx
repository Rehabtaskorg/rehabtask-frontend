"use client";

import { MdLock, MdHourglassTop, MdError } from "react-icons/md";

const VARIANTS = {
    pending: {
        icon: MdHourglassTop,
        iconColor: "text-yellow-500",
        bg: "bg-yellow-50/80 ",
        border: "border-yellow-200 ",
    },
    rejected: {
        icon: MdError,
        iconColor: "text-red-500",
        bg: "bg-red-50/80 ",
        border: "border-red-200 ",
    },
    locked: {
        icon: MdLock,
        iconColor: "text-text-muted",
        bg: "bg-muted-light/80 ",
        border: "border-border-light ",
    },
};

export default function RestrictedFeatureOverlay({ variant = "pending", title, message, actionLabel, onAction }) {
    const config = VARIANTS[variant] || VARIANTS.locked;
    const Icon = config.icon;

    return (
        <div className={`flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border ${config.bg} ${config.border}`}>
            <Icon className={`text-4xl ${config.iconColor}`} />
            <h3 className="text-lg font-bold text-text-main  mt-4">{title}</h3>
            <p className="text-sm text-text-muted  mt-2 max-w-md">{message}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:brightness-95 transition-all"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}