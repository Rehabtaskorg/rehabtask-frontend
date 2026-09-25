"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getFocusable = (container) => {
    if (!container) return [];
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
    );
};

/**
 * Traps keyboard focus inside a container while it is open, and restores focus
 * to the element that was focused before opening once it closes.
 *
 * Moves focus to the first focusable descendant on open, falling back to the
 * container itself (which must carry `tabIndex={-1}`) when it holds no
 * focusable children. Tab and Shift+Tab cycle within the container, and Escape
 * invokes `onEscape` when provided.
 *
 * @param {Object} params
 * @param {boolean} params.isOpen - Whether the trapping container is mounted and active.
 * @param {() => void} [params.onEscape] - Called when Escape is pressed. Omit to disable Escape handling.
 * @returns {import('react').RefObject<HTMLElement>} Ref to attach to the trapping container.
 */
export function useFocusTrap({ isOpen, onEscape }) {
    const containerRef = useRef(null);
    const previousFocusRef = useRef(null);
    const onEscapeRef = useRef(onEscape);

    useEffect(() => {
        onEscapeRef.current = onEscape;
    }, [onEscape]);

    useEffect(() => {
        if (!isOpen) return undefined;

        previousFocusRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;

        const container = containerRef.current;
        const initial = getFocusable(container);
        if (initial.length > 0) initial[0].focus();
        else container?.focus?.();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onEscapeRef.current?.();
                return;
            }

            if (event.key !== "Tab") return;

            const items = getFocusable(containerRef.current);
            if (items.length === 0) {
                event.preventDefault();
                containerRef.current?.focus?.();
                return;
            }

            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;
            const isInside = containerRef.current?.contains(active);

            if (!isInside) {
                event.preventDefault();
                first.focus();
                return;
            }

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocusRef.current?.focus?.();
        };
    }, [isOpen]);

    return containerRef;
}
