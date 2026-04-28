"use client";

import Link from "next/link";

export default function TherapistInputActions({ customerUserId }) {
    if (!customerUserId) return null;

    return (
        <Link
            href={`/therapist/requests`}
            className="flex items-center gap-1.5 hover:text-primary transition-colors text-primary text-xs font-bold"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Browse Requests & Send Offer
        </Link>
    );
}
