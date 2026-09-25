"use client";

import { useCallback, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export const DRAWER_SIZES = {
    SM: "sm",
    MD: "md",
    LG: "lg",
};

const SIZE_CLASSES = {
    [DRAWER_SIZES.SM]: "max-w-96",
    [DRAWER_SIZES.MD]: "max-w-120",
    [DRAWER_SIZES.LG]: "max-w-3xl",
};

/**
 * Generic right-hand slide-over panel with backdrop, focus trap, focus restore
 * and escape-to-close. Renders nothing when `isOpen` is false.
 *
 * Dismissal (escape key, backdrop click and the close button) is suppressed
 * while `isDismissDisabled` is true, so an in-flight save cannot be
 * interrupted. Body scroll is locked for as long as the drawer is open.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls mounting of the drawer.
 * @param {() => void} props.onClose - Invoked on escape, backdrop click and close button.
 * @param {string} props.title - Accessible panel name, rendered as the heading when `isHeaderHidden` is false.
 * @param {string} [props.description] - Optional supporting line under the title.
 * @param {import('react').ReactNode} [props.children] - Scrollable drawer body content.
 * @param {import('react').ReactNode} [props.footer] - Optional action row pinned to the bottom.
 * @param {keyof typeof SIZE_CLASSES} [props.size] - Max width preset, defaults to `DRAWER_SIZES.MD`.
 * @param {boolean} [props.isDismissDisabled] - Blocks every dismissal path while true.
 * @param {boolean} [props.isHeaderHidden] - Hides the visual header while keeping `title` as the accessible name.
 * @param {string} [props.className] - Extra classes for the drawer panel.
 */
export function Drawer({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = DRAWER_SIZES.MD,
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

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40" onClick={handleDismiss} />

            <aside
                ref={containerRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`fixed right-0 top-0 z-50 flex h-dvh w-full ${SIZE_CLASSES[size] ?? SIZE_CLASSES[DRAWER_SIZES.MD]} flex-col border-l border-border-light bg-card-light shadow-2xl outline-none ${className}`}
            >
                {!isHeaderHidden && (
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border-light px-6 py-4">
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold text-text-main">{title}</h2>
                            {description && (
                                <p className="mt-0.5 text-xs text-text-muted">{description}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            disabled={isDismissDisabled}
                            aria-label="Close panel"
                            className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-muted-light hover:text-text-main disabled:opacity-50"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    </div>
                )}

                <div className="panel-scroll min-h-0 flex-1 overflow-y-auto p-6">{children}</div>

                {footer && (
                    <div className="shrink-0 border-t border-border-light px-6 py-4">{footer}</div>
                )}
            </aside>
        </>
    );
}
