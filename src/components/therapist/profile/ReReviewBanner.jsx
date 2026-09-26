import { MdHistory } from "react-icons/md";
import { Badge, BADGE_VARIANTS } from "@/components/ui/Badge";
import { APPROVAL_STATUS } from "@/lib/constants";

const THERAPIST_SOFT_COPY = {
    title: "Changes submitted for review",
    body: "Your profile stays visible and bookings continue as normal.",
};

const THERAPIST_HARD_COPY = {
    title: "Your profile is under review",
    body: "Your profile is hidden from new patients, and new requests and new messages are paused until a reviewer approves your changes. Existing bookings are unaffected. You can keep editing your profile while you wait.",
};

/**
 * Page-level notice shown while profile edits are awaiting a reviewer.
 *
 * Two distinct cases, deliberately not sharing copy: a soft re-review leaves the
 * account fully operational, whereas a hard re-review drops it back to `review`,
 * which also gates messaging server-side.
 *
 * The defaults describe a therapist's consequences — being hidden from patient
 * search. An account that is not listed in the marketplace, a customer for
 * example, loses booking and messaging instead and must pass its own
 * `softCopy`/`hardCopy` rather than inherit wording that does not apply to it.
 *
 * Renders nothing when there is no pending re-review.
 *
 * @param {Object} props
 * @param {string|null} [props.pendingReviewAt] - Set when unreviewed changes exist.
 * @param {string} [props.approvalStatus] - Current `APPROVAL_STATUS` value.
 * @param {{ title: string, body: string }} [props.softCopy] - Soft-review wording; defaults to the therapist copy.
 * @param {{ title: string, body: string }} [props.hardCopy] - Hard-review wording; defaults to the therapist copy.
 */
export function ReReviewBanner({
    pendingReviewAt,
    approvalStatus,
    softCopy = THERAPIST_SOFT_COPY,
    hardCopy = THERAPIST_HARD_COPY,
}) {
    if (!pendingReviewAt) return null;

    const isHardReview = approvalStatus === APPROVAL_STATUS.REVIEW;
    const copy = isHardReview ? hardCopy : softCopy;

    return (
        <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4"
        >
            <MdHistory className="mt-0.5 shrink-0 text-xl text-violet-700" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-violet-900">{copy.title}</p>
                    <Badge variant={BADGE_VARIANTS.REVIEW}>Pending review</Badge>
                </div>
                <p className="mt-1 text-sm text-violet-800">{copy.body}</p>
            </div>
        </div>
    );
}
