"use client";

import { MdCheckCircle, MdError } from "react-icons/md";

/**
 * Reusable centered card for transitional states in the Stripe onboarding flow.
 * Renders a spinner card, a success card, or an account-creation error card
 * depending on the `variant` prop.
 *
 * @param {{ variant: "initializing" | "creating" | "verifying" | "complete" | "error", errorMessage?: string, onRetry?: () => void, onSkip?: () => void }} props
 */
export default function StripeStatusCard({ variant, errorMessage, onRetry, onSkip }) {
    if (variant === "complete") {
        return (
            <div className="bg-card-light border border-border-light rounded-xl p-12 shadow-sm flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <MdCheckCircle className="text-emerald-500 text-4xl" />
                </div>
                <p className="text-text-main font-bold text-xl">Payout setup complete!</p>
                <p className="text-text-muted text-sm">Redirecting you to your final review…</p>
            </div>
        );
    }

    if (variant === "error") {
        return (
            <div className="bg-card-light border border-border-light rounded-xl p-8 shadow-sm space-y-5">
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                    <MdError className="text-red-500 text-xl shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onRetry}
                        className="w-full bg-primary hover:brightness-95 text-white px-8 py-3 rounded-lg font-bold transition-all"
                    >
                        Try again
                    </button>
                    <button
                        onClick={onSkip}
                        className="w-full text-text-muted hover:text-text-main px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                        I&apos;ll do this later
                    </button>
                </div>
            </div>
        );
    }

    const SPINNER_LABELS = {
        initializing: { primary: null, secondary: "Loading payment setup…" },
        creating: { primary: "Setting up your payment account…", secondary: "This only takes a moment." },
        verifying: { primary: "Verifying your account…", secondary: "Just a moment while we confirm everything is in order." },
    };

    const { primary, secondary } = SPINNER_LABELS[variant] ?? {};

    return (
        <div className="bg-card-light border border-border-light rounded-xl p-12 shadow-sm flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            {primary && <p className="text-text-main font-semibold">{primary}</p>}
            {secondary && <p className="text-text-muted text-sm">{secondary}</p>}
        </div>
    );
}