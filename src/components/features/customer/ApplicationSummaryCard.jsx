"use client";

import Link from "next/link";

/**
 * Read-only summary of a saved onboarding section, with an Edit link back
 * to the originating onboarding step.
 *
 * @param {{
 *   title: string,
 *   editHref: string,
 *   fields: Array<{ label: string, value: string|null|undefined }>,
 * }} props
 */
export function ApplicationSummaryCard({ title, editHref, fields }) {
    return (
        <section className="border border-border-light rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-text-main">{title}</h3>
                <Link href={editHref} className="text-sm font-semibold text-primary underline hover:no-underline shrink-0">
                    Edit
                </Link>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {fields.map(({ label, value }) => (
                    <div key={label}>
                        <dt className="text-xs text-text-muted">{label}</dt>
                        <dd className="text-sm text-text-main break-words">{value || "—"}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}