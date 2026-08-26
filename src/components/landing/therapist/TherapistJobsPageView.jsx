"use client";

import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * Fires the therapist_landing_page_viewed PostHog event on mount.
 * Extracted as a client component so the parent page stays a Server Component
 * (required for the async Stats component to work).
 */
export function TherapistJobsPageView() {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        trackEvent("therapist_landing_page_viewed");
    }, [trackEvent]);

    return null;
}