import { MdFiberNew, MdSwapHoriz } from "react-icons/md";
import { Badge, BADGE_VARIANTS } from "@/components/ui/Badge";

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
 * Therapist-facing flags marking a document as uploaded since the review window
 * opened and/or as a replacement for an earlier file. Renders nothing when
 * neither applies, so callers can drop it in unconditionally.
 *
 * @param {Object} props
 * @param {string|null} [props.uploadedAt] - When this document was uploaded.
 * @param {string|null} [props.reviewStartedAt] - When the current review window opened.
 * @param {string|null} [props.supersedesId] - Id of the document this one replaced.
 */
export function DocumentStatusFlags({ uploadedAt, reviewStartedAt, supersedesId }) {
    const isNew = isUploadedSinceReview(uploadedAt, reviewStartedAt);
    const isReplacement = Boolean(supersedesId);

    if (!isNew && !isReplacement) return null;

    return (
        <span className="inline-flex flex-wrap items-center gap-1.5">
            {isNew && (
                <Badge
                    variant={BADGE_VARIANTS.REVIEW}
                    icon={<MdFiberNew className="text-sm" />}
                    title="Uploaded after this review window opened"
                >
                    New since review
                </Badge>
            )}
            {isReplacement && (
                <Badge
                    variant={BADGE_VARIANTS.NEUTRAL}
                    icon={<MdSwapHoriz className="text-sm" />}
                    title="This document replaces an earlier upload"
                >
                    Replaces previous
                </Badge>
            )}
        </span>
    );
}
