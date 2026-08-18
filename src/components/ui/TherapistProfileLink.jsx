import Link from "next/link";
import { MdOpenInNew } from "react-icons/md";
import { APPROVAL_STATUS } from "@/lib/constants";

/**
 * Link to a therapist's profile page within the customer dashboard.
 * Renders nothing when the profile is unreachable (missing id, or not approved).
 *
 * Note: a therapist whose User.isActive is false will still render a link that
 * 404s — isActive is not present on the offer payload and cannot be guarded here.
 *
 * @param {Object} props
 * @param {Object} props.therapist   - TherapistProfile-shaped object; requires `id`
 * @param {string} [props.label]     - Visible link text
 * @param {string} [props.className] - Layout classes only (margin/alignment), not typography
 */
export const TherapistProfileLink = ({ therapist, label = "View Profile", className = "" }) => {
    if (!therapist?.id) return null;
    if (therapist.approvalStatus !== APPROVAL_STATUS.APPROVED) return null;

    return (
        <Link
            href={`/customer/find-therapists/${therapist.id}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} for ${therapist.fullName || "therapist"} (opens in a new tab)`}
            className={`inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-primary transition-colors ${className}`.trim()}
        >
            {label}
            <MdOpenInNew className="text-xs" aria-hidden="true" />
        </Link>
    );
};
