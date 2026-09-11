import { MdHistory } from "react-icons/md";

const SIZE_STYLES = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
};

/**
 * Pill shown on an account that has unreviewed profile changes since its last
 * approval decision. Renders nothing when there is no pending re-review, so
 * callers can drop it in unconditionally.
 *
 * Uses a violet palette so it never reads as an approval-status pill
 * (amber/blue/emerald/red) when the two sit side by side.
 *
 * @param {{ pendingReviewAt?: string|null, size?: "sm"|"md" }} props
 */
export function PendingReviewBadge({ pendingReviewAt, size = "sm" }) {
    if (!pendingReviewAt) return null;

    return (
        <span
            title="This account has profile changes that have not been reviewed yet"
            className={`inline-flex items-center rounded-full font-medium bg-violet-100 text-violet-700 whitespace-nowrap ${SIZE_STYLES[size] ?? SIZE_STYLES.sm}`}
        >
            <MdHistory className="text-sm shrink-0" aria-hidden="true" />
            Pending Review
        </span>
    );
}
