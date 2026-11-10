"use client";

import { useSyncExternalStore } from "react";

const getSnapshot = () => document.body.style.overflow === "hidden";

const getServerSnapshot = () => false;

const subscribe = (onChange) => {
    const observer = new MutationObserver(onChange);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
};

export function useBodyScrollLocked() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
