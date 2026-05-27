"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "identified_only",
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: false,
        disable_session_recording: true,
    });
}

/**
 * Tracks controlled page views, excluding PHI-sensitive routes.
 * - /customer/requests/new — has its own step-level funnel events
 * - /customer/messages, /therapist/messages — URL never changes between conversations
 * - /customer/patients — entire page is a patient PHI roster
 * - /admin/audit-logs — changes JSON contains PHI diffs
 */
function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const posthogClient = usePostHog();

    useEffect(() => {
        if (!pathname || !posthogClient) return;

        const excluded = [
            "/customer/requests/new",
            "/customer/messages",
            "/therapist/messages",
            "/customer/patients",
            "/admin/audit-logs",
        ];

        const isExcluded = excluded.some((route) => pathname.startsWith(route));
        if (isExcluded) return;

        const url = window.origin + pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
        posthogClient.capture("$pageview", { $current_url: url });
    }, [pathname, searchParams, posthogClient]);

    return null;
}

/**
 * Wraps the app with PostHog analytics.
 * PostHogPageView is in Suspense because useSearchParams() requires it in Next.js 15.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function PostHogProvider({ children }) {
    return (
        <PHProvider client={posthog}>
            <Suspense fallback={null}>
                <PostHogPageView />
            </Suspense>
            {children}
        </PHProvider>
    );
}