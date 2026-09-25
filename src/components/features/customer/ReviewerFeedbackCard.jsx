"use client";

import { MdInfo } from "react-icons/md";

/**
 * Amber feedback card shown to rejected customers on the application review page.
 * Falls back to generic copy when the reviewer left no written reason.
 *
 * @param {{ rejectionReason: string|null }} props
 */
export function ReviewerFeedbackCard({ rejectionReason }) {
    return (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-4" aria-labelledby="reviewer-feedback-heading">
            <div className="flex items-start gap-3">
                <MdInfo className="shrink-0 text-xl text-amber-600 mt-0.5" aria-hidden="true" />
                <div className="min-w-0 space-y-2">
                    <h2 id="reviewer-feedback-heading" className="text-sm font-bold text-amber-900">
                        What our reviewer asked for
                    </h2>
                    {rejectionReason ? (
                        <blockquote className="max-h-32 overflow-y-auto text-sm text-amber-900 leading-relaxed whitespace-pre-wrap border-l-2 border-amber-300 pl-3">
                            {rejectionReason}
                        </blockquote>
                    ) : (
                        <p className="text-sm text-amber-900 leading-relaxed">
                            Our reviewer didn&apos;t leave specific notes. Please double-check your documents and details,
                            or{" "}
                            <a href="mailto:support@rehabtask.com" className="font-semibold underline hover:no-underline">
                                email support@rehabtask.com
                            </a>{" "}
                            and we&apos;ll walk you through it.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}