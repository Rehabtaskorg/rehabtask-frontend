"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        person_profiles: "always",
        capture_pageview: false,
        capture_pageleave: true,
    });
}

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

function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const posthogClient = usePostHog();

    useEffect(() => {
        if (pathname && posthogClient) {
            let url = window.origin + pathname;
            if (searchParams.toString()) {
                url += `?${searchParams.toString()}`;
            }
            posthogClient.capture("$pageview", { $current_url: url });
        }
    }, [pathname, searchParams, posthogClient]);

    return null;
}
