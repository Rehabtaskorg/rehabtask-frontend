import { MdFiberNew, MdSwapHoriz } from "react-icons/md";

/**
 * True when a document was uploaded after the current review window opened.
 * Returns false unless both timestamps are present.
 *
 * @param {string|null|undefined} uploadedAt
 * @param {string|null|undefined} reviewStartedAt
 * @returns {boolean}
 */
export function isUploadedSinceReview(uploadedAt, reviewStartedAt) {
    if (!uploadedAt || !reviewStartedAt) return false;
    return new Date(uploadedAt).getTime() > new Date(reviewStartedAt).getTime();
}

/**
 * Small pills marking a document as newly uploaded since the review window
 * opened and/or as a replacement for an earlier document. Renders nothing when
 * neither applies.
 *
 * @param {{ uploadedAt?: string|null, reviewStartedAt?: string|null, supersedesId?: string|null }} props
 */
export function DocumentReviewFlags({ uploadedAt, reviewStartedAt, supersedesId }) {
    const isNew = isUploadedSinceReview(uploadedAt, reviewStartedAt);
    const isReplacement = Boolean(supersedesId);

    if (!isNew && !isReplacement) return null;

    return (
        <span className="inline-flex items-center gap-1.5 flex-wrap">
            {isNew && (
                <span
                    title="Uploaded after this review window opened"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium whitespace-nowrap"
                >
                    <MdFiberNew className="text-sm shrink-0" aria-hidden="true" />
                    New since review
                </span>
            )}
            {isReplacement && (
                <span
                    title="This document replaces an earlier upload"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium whitespace-nowrap"
                >
                    <MdSwapHoriz className="text-sm shrink-0" aria-hidden="true" />
                    Replaces previous
                </span>
            )}
        </span>
    );
}
