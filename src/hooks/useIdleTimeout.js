import { useEffect, useRef, useCallback } from "react";

const IDLE_MS = 15 * 60 * 1000;
const EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

/**
 * Calls onIdle after IDLE_MS of no user activity.
 * Resets on mousemove, mousedown, keydown, touchstart, or scroll.
 * Cleans up all listeners and the timer on unmount.
 * Pass null for onIdle to disable the timer (e.g. during loading state).
 *
 * @param {Function|null} onIdle - called when idle threshold is reached; null disables the timer
 */
export function useIdleTimeout(onIdle) {
    const timer = useRef(null);
    const onIdleRef = useRef(onIdle);

    useEffect(() => {
        onIdleRef.current = onIdle;
    }, [onIdle]);

    const reset = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onIdleRef.current?.(), IDLE_MS);
    }, []);

    useEffect(() => {
        if (!onIdle) return;
        EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
        reset();
        return () => {
            EVENTS.forEach((e) => window.removeEventListener(e, reset));
            if (timer.current) clearTimeout(timer.current);
        };
    }, [onIdle, reset]);
}