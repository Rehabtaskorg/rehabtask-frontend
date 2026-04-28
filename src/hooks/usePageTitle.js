"use client";

import { useEffect } from "react";

/**
 * Sets the browser tab title for client-component pages
 * Appends " | RehabTask" suffix to match the root layout metadata template.
 * @param {string} title - The page-specific title (e.g., "Dashboard")
 */
export function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | RehabTask` : "RehabTask";
    }, [title]);
}