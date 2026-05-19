"use client";

import { MdClose } from "react-icons/md";

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
    if (!isOpen) return null;

    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget && !loading) onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdrop}
        >
            <div className="bg-card-light  rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-light  flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon}
                        <h2 className="text-lg font-semibold text-text-main ">{title}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
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
