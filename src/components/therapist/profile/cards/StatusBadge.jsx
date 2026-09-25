import { MdVerified, MdPending, MdCancel } from "react-icons/md";
import { Badge, BADGE_VARIANTS, BADGE_SIZES } from "@/components/ui/Badge";
import { APPROVAL_STATUS } from "@/lib/constants";

const STATUS_CONFIG = {
    [APPROVAL_STATUS.APPROVED]: {
        variant: BADGE_VARIANTS.SUCCESS,
        icon: <MdVerified className="text-sm" />,
        label: "Approved",
    },
    [APPROVAL_STATUS.PENDING]: {
        variant: BADGE_VARIANTS.WARNING,
        icon: <MdPending className="text-sm" />,
        label: "Pending",
    },
    [APPROVAL_STATUS.REVIEW]: {
        variant: BADGE_VARIANTS.WARNING,
        icon: <MdPending className="text-sm" />,
        label: "Under Review",
    },
    [APPROVAL_STATUS.REJECTED]: {
        variant: BADGE_VARIANTS.DANGER,
        icon: <MdCancel className="text-sm" />,
        label: "Rejected",
    },
};

/**
 * Approval-status pill for the therapist's own profile. Falls back to the
 * pending presentation for any unrecognised status, matching the behaviour of
 * the inline badge it replaces.
 *
 * @param {Object} props
 * @param {string} [props.status] - One of `APPROVAL_STATUS`.
 */
export function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[APPROVAL_STATUS.PENDING];

    return (
        <Badge variant={config.variant} size={BADGE_SIZES.MD} icon={config.icon}>
            {config.label}
        </Badge>
    );
}
