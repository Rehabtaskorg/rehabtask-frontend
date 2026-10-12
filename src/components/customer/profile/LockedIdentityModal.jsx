"use client";

import { MdLock, MdMailOutline } from "react-icons/md";
import { Modal, MODAL_SIZES } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatShortDate } from "@/utils/dates";
import { CustomerInfoRow } from "./cards/CustomerInfoRow";

const SUPPORT_EMAIL = "support@rehabtask.com";
const SUPPORT_SUBJECT = "Account name or date of birth change request";

/**
 * Read-only view of the identity fields a customer cannot edit themselves,
 * with the supported route for changing them.
 *
 * `fullName` and `dateOfBirth` are VERIFIED_HARD server-side: editing either
 * returns an approved account to review and suspends marketplace access, so
 * there is no self-service path in this phase. Changes go through support.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the modal.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Customer profile supplying the identity values.
 * @param {boolean} [props.isDateOfBirthShown] - Adds the date of birth row (individual customers).
 */
export function LockedIdentityModal({ isOpen, onClose, profile, isDateOfBirthShown }) {
    const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Verified details"
            icon={<MdLock className="text-xl text-text-muted" aria-hidden="true" />}
            size={MODAL_SIZES.LG}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <a
                        href={mailtoHref}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
                    >
                        <MdMailOutline className="text-base" aria-hidden="true" />
                        Request a change
                    </a>
                </div>
            }
        >
            <div className="space-y-5">
                <div className="flex items-start gap-2 rounded-lg border border-border-light bg-muted-light p-3">
                    <MdLock className="mt-0.5 shrink-0 text-sm text-text-muted" aria-hidden="true" />
                    <p className="text-xs text-text-muted">
                        These details were checked when your account was approved, so they can&apos;t
                        be edited here. Email support and a reviewer will update them for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                    <CustomerInfoRow label="Full Name" value={profile?.fullName} />
                    {isDateOfBirthShown && (
                        <CustomerInfoRow
                            label="Date of Birth"
                            value={profile?.dateOfBirth ? formatShortDate(profile.dateOfBirth) : null}
                        />
                    )}
                </div>

                <p className="text-xs text-text-muted">
                    Include what needs correcting and attach supporting documentation where you have
                    it.
                </p>
            </div>
        </Modal>
    );
}
