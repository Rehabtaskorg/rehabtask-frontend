"use client";

import { useCallback, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export const MODAL_SIZES = {
    SM: "sm",
    MD: "md",
    LG: "lg",
    XL: "xl",
};

const SIZE_CLASSES = {
    [MODAL_SIZES.SM]: "max-w-sm",
    [MODAL_SIZES.MD]: "max-w-md",
    [MODAL_SIZES.LG]: "max-w-lg",
    [MODAL_SIZES.XL]: "max-w-2xl",
};

/**
 * Generic centred modal shell with backdrop, focus trap, focus restore and
 * escape-to-close. Renders nothing when `isOpen` is false.
 *
 * Dismissal (escape key, backdrop click and the close button) is suppressed
 * while `isDismissDisabled` is true, so in-flight mutations cannot be
 * interrupted. Body scroll is locked for as long as the modal is open.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls mounting of the modal.
 * @param {() => void} props.onClose - Invoked on escape, backdrop click and close button.
 * @param {string} props.title - Accessible dialog name, rendered as the heading when `isHeaderHidden` is false.
 * @param {import('react').ReactNode} [props.children] - Modal body content.
 * @param {import('react').ReactNode} [props.footer] - Optional action row pinned below the body.
 * @param {import('react').ReactNode} [props.icon] - Optional icon rendered beside the title.
 * @param {keyof typeof SIZE_CLASSES} [props.size] - Max width preset, defaults to `MODAL_SIZES.MD`.
 * @param {boolean} [props.isDismissDisabled] - Blocks every dismissal path while true.
 * @param {boolean} [props.isHeaderHidden] - Hides the visual header while keeping `title` as the accessible name.
 * @param {string} [props.className] - Extra classes for the dialog panel.
 */
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    icon,
    size = MODAL_SIZES.MD,
    isDismissDisabled = false,
    isHeaderHidden = false,
    className = "",
}) {
    const handleDismiss = useCallback(() => {
        if (!isDismissDisabled) onClose();
    }, [isDismissDisabled, onClose]);

    const containerRef = useFocusTrap({ isOpen, onEscape: handleDismiss });

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) handleDismiss();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                ref={containerRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`flex max-h-[90dvh] w-full ${SIZE_CLASSES[size] ?? SIZE_CLASSES[MODAL_SIZES.MD]} flex-col overflow-hidden rounded-xl bg-card-light shadow-2xl outline-none ${className}`}
            >
                {!isHeaderHidden && (
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-light px-6 py-4">
                        <div className="flex min-w-0 items-center gap-2">
                            {icon}
                            <h2 className="truncate text-lg font-semibold text-text-main">{title}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            disabled={isDismissDisabled}
                            aria-label="Close dialog"
                            className="p-1 text-text-muted transition-colors hover:text-text-main disabled:opacity-50"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>

                {footer && (
                    <div className="shrink-0 border-t border-border-light px-6 py-4">{footer}</div>
                )}
            </div>
        </div>
    );
}
