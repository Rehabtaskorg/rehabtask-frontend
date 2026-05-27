"use client";

import { MdLock } from "react-icons/md";

const REQUIREMENTS = [
    "Bank account or debit card for direct deposits",
    "Government-issued photo ID",
    "Social Security Number (SSN) or EIN",
    "About 5–10 minutes",
];

/**
 * Intro card shown before a Stripe Connect account has been created.
 * Outlines what the therapist needs and provides the primary CTA.
 *
 * @param {{ onSetup: () => void, onSkip: () => void }} props
 */
export default function StripeIdleCard({ onSetup, onSkip }) {
    return (
        <div className="bg-card-light border border-border-light rounded-xl p-8 shadow-sm">
            <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-text-main mb-2">Secure Payout Setup</h2>
                    <p className="text-text-muted text-sm max-w-md">
                        Set up your bank account directly in RehabTask. Your financial details are encrypted by our trusted payments processor — never stored on our servers.
                    </p>
                </div>

                <div className="w-full bg-slate-50 rounded-lg p-5 text-left space-y-3 border border-border-light">
                    <p className="text-sm font-semibold text-text-main mb-3">What you&apos;ll need:</p>
                    {REQUIREMENTS.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                            <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-text-muted">{item}</span>
                        </div>
                    ))}
                </div>

                <div className="w-full flex flex-col gap-3 mt-2">
                    <button
                        onClick={onSetup}
                        className="w-full bg-primary hover:brightness-95 text-white px-8 py-4 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Set Up Payouts
                    </button>
                    <button
                        onClick={onSkip}
                        className="w-full text-text-muted hover:text-text-main px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                        I&apos;ll do this later
                    </button>
                    <p className="text-xs text-text-muted -mt-1">
                        You can set up payouts anytime from your Earnings page. This won&apos;t delay your review.
                    </p>
                </div>

                <div className="flex items-center gap-2 text-text-muted text-xs">
                    <MdLock className="text-sm shrink-0" />
                    <span>All financial data is encrypted and processed securely. RehabTask never stores your bank details.</span>
                </div>
            </div>
        </div>
    );
}