"use client";

import { MdError } from "react-icons/md";

/**
 * Shown when the Stripe embedded SDK fails to load after the auto-retry.
 * Gives the therapist a manual retry option.
 *
 * @param {{ onRetry: () => void }} props
 */
export default function StripeLoadErrorCard({ onRetry }) {
    return (
        <div className="bg-card-light border border-border-light rounded-xl p-8 text-center space-y-4">
            <MdError className="text-red-500 text-4xl mx-auto" />
            <p className="text-text-main font-semibold">Failed to load payment setup</p>
            <p className="text-text-muted text-sm">
                We couldn&apos;t connect to the payment module. Please check your connection and try again.
            </p>
            <button
                onClick={onRetry}
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:brightness-95 transition-all"
            >
                Try again
            </button>
        </div>
    );
}