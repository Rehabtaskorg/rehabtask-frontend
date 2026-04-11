"use client";

import Link from "next/link";
import { MdEdit, MdArrowForward } from "react-icons/md";

/**
 * RevisionStatusBanner — shown on the booking detail page when a session is
 * in `in_revision` state. Displays the customer's reason, the therapist's
 * committed response date (if set), and a deep link to the booking chat
 * where any revised documentation will be shared.
 *
 * Audience-aware: copy adjusts based on whether `viewerRole` is "customer"
 * or "therapist", since they see the same banner from different sides.
 */
export default function RevisionStatusBanner({
    revisionRequestedAt,
    revisionReason,
    revisionDueBy,
    revisionCount,
    conversationHref,
    viewerRole,
}) {
    const requestedDate = revisionRequestedAt
        ? new Date(revisionRequestedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : null;

    const dueByDate = revisionDueBy
        ? new Date(revisionDueBy).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        })
        : null;

    const heading =
        viewerRole === "therapist"
            ? "Revision requested"
            : "Revision in progress";

    const subline =
        viewerRole === "therapist"
            ? "The customer is asking for changes before confirming this session."
            : "Waiting for the therapist to address your request and resubmit.";

    return (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/30 rounded-xl shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
                {/* Icon strip */}
                <div className="bg-amber-500/10 dark:bg-amber-500/20 px-4 py-4 md:py-6 flex items-center justify-center md:w-16 shrink-0">
                    <MdEdit className="text-amber-600 dark:text-amber-400 text-2xl" />
                </div>

                {/* Content */}
                <div className="flex-1 p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-text-main dark:text-white text-base">
                                {heading}
                            </h3>
                            <p className="text-sm text-text-muted dark:text-amber-200/70 mt-0.5">
                                {subline}
                            </p>

                            {/* Date row */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
                                {requestedDate && (
                                    <span className="text-text-muted dark:text-amber-200/60">
                                        <span className="font-semibold">Requested:</span> {requestedDate}
                                    </span>
                                )}
                                {dueByDate && (
                                    <span className="text-amber-700 dark:text-amber-300 font-semibold">
                                        {viewerRole === "therapist"
                                            ? `You committed to resubmit by ${dueByDate}`
                                            : `Therapist will resubmit by ${dueByDate}`}
                                    </span>
                                )}
                                {revisionCount > 1 && (
                                    <span className="text-text-muted dark:text-amber-200/60">
                                        Round {revisionCount}
                                    </span>
                                )}
                            </div>

                            {/* Quoted reason */}
                            {revisionReason && (
                                <div className="mt-4 pl-3 border-l-2 border-amber-300 dark:border-amber-500/40">
                                    <p className="text-sm italic text-text-main dark:text-amber-100/90 leading-relaxed">
                                        &ldquo;{revisionReason}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Conversation link */}
                        {conversationHref && (
                            <div className="shrink-0">
                                <Link
                                    href={conversationHref}
                                    className="inline-flex items-center gap-1 text-primary hover:underline text-sm font-semibold whitespace-nowrap"
                                >
                                    View conversation
                                    <MdArrowForward className="text-base" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
