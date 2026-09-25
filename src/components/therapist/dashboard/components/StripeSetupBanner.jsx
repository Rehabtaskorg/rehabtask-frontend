"use client";

import { MdWarning, MdArrowForward } from "react-icons/md";

/**
 * Amber payout-setup CTA banner for the therapist dashboard.
 *
 * @param {{ title: string, description: string, ctaLabel: string, onCtaClick: () => void }} props
 * @returns {JSX.Element}
 */
export function StripeSetupBanner({ title, description, ctaLabel, onCtaClick }) {
    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-3">
                <MdWarning className="text-amber-600 text-xl shrink-0" />
                <div>
                    <p className="text-slate-900 font-bold text-sm sm:text-base leading-tight">
                        {title}
                    </p>
                    <p className="text-amber-800 text-xs sm:text-sm mt-1">
                        {description}
                    </p>
                </div>
            </div>
            <button
                onClick={onCtaClick}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shrink-0 w-full sm:w-auto justify-center"
            >
                {ctaLabel} <MdArrowForward className="text-lg" />
            </button>
        </div>
    );
}