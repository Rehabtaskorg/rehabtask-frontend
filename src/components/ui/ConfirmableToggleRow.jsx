"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const ConfirmModal = dynamic(() => import("@/components/ui/ConfirmModal"), { ssr: false });

export function ConfirmableToggleRow({
    label,
    description,
    isChecked,
    onToggle,
    isDisabled,
    isPending,
    ariaLabel,
    confirmOn,
    confirmTitle,
    confirmMessage,
    confirmLabel = "Confirm",
}) {
    const [pendingValue, setPendingValue] = useState(null);

    const needsConfirm = (next) =>
        confirmOn === "both" || (confirmOn === "on" && next) || (confirmOn === "off" && !next);

    const handleClick = () => {
        const next = !isChecked;
        if (needsConfirm(next)) {
            setPendingValue(next);
            return;
        }
        onToggle(next);
    };

    const handleConfirm = async () => {
        const next = pendingValue;
        setPendingValue(null);
        await onToggle(next);
    };

    return (
        <>
            <div className="flex items-center justify-between py-2">
                <div>
                    <p className="text-sm text-text-muted">{label}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{description}</p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={isChecked}
                    aria-label={ariaLabel}
                    onClick={handleClick}
                    disabled={isDisabled || isPending}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isChecked ? "bg-primary" : "bg-gray-300"}`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${isChecked ? "translate-x-5" : "translate-x-0"}`}
                    />
                </button>
            </div>

            <ConfirmModal
                isOpen={pendingValue !== null}
                onClose={() => setPendingValue(null)}
                onConfirm={handleConfirm}
                title={confirmTitle}
                message={confirmMessage}
                confirmLabel={confirmLabel}
                loading={isPending}
            />
        </>
    );
}
