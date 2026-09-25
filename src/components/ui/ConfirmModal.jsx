"use client";

import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmClassName = "bg-primary hover:bg-primary/90 text-white",
    loading = false,
    icon,
}) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        previousFocusRef.current = document.activeElement;
        const focusable = modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
        focusable?.[0]?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                if (!loading) onClose();
                return;
            }

            if (event.key !== "Tab") return;

            const items = modalRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);
            if (!items || items.length === 0) return;

            const first = items[0];
            const last = items[items.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocusRef.current?.focus?.();
        };
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget && !loading) onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdrop}
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="bg-card-light  rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-border-light  flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h2 className="text-lg font-semibold text-text-main ">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close dialog"
                        className="text-text-muted  hover:text-text-main  transition-colors p-1 disabled:opacity-50"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-sm text-text-muted ">{message}</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 text-sm font-semibold text-text-muted  hover:text-text-main  border border-border-light  rounded-lg transition-colors disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${confirmClassName}`}
                        >
                            {loading ? "Processing..." : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}