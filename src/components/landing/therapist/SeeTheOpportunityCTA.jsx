"use client";

import Link from "next/link";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * CTA button for the SeeTheOpportunity section.
 * Isolated as a client component so the parent section stays a Server Component.
 */
export function SeeTheOpportunityCTA() {
    const { trackEvent } = useAnalytics();

    return (
        <Link
            href="/requests"
            onClick={() => trackEvent("browse_referrals_clicked", { source: "opportunity_preview" })}
            className="group inline-flex items-center gap-2 mt-8 px-6 py-3 text-sm font-semibold text-white bg-accent-strong rounded-lg hover:bg-accent-strong/90 transition-colors"
        >
            Browse Opportunities
            <span className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">&rarr;</span>
        </Link>
    );
}