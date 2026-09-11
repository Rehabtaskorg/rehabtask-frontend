"use client";

import { MdLock, MdMailOutline } from "react-icons/md";
import { Modal, MODAL_SIZES } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { LICENSE_TYPES } from "@/lib/constants/credentials";
import { InfoRow } from "./cards/InfoRow";

const SUPPORT_EMAIL = "support@rehabtask.com";
const SUPPORT_SUBJECT = "Credential change request";

/**
 * Read-only view of the six verified credential fields, with the supported
 * route for changing them.
 *
 * These fields are VERIFIED_HARD server-side: editing any of them returns an
 * approved therapist to review and hides them from new patients, so there is no
 * self-service path in this phase. Changes go through support.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the modal.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Therapist profile supplying the credential values.
 */
export function CredentialsEditModal({ isOpen, onClose, profile }) {
    const licenseTypeLabel =
        LICENSE_TYPES.find((lt) => lt.value === profile?.primaryLicenseType)?.label ||
        profile?.primaryLicenseType ||
        "—";

    const additionalStates = profile?.additionalLicenseStates?.length
        ? profile.additionalLicenseStates.join(", ")
        : null;

    const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Credentials"
            icon={<MdLock className="text-xl text-text-muted" aria-hidden="true" />}
            size={MODAL_SIZES.XL}
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
                        These details were verified when your application was approved, so they
                        can&apos;t be edited here. Email support and a reviewer will update them for
                        you.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                    <InfoRow label="Full Name" value={profile?.fullName} />
                    <InfoRow label="Discipline type" value={licenseTypeLabel} />
                    <InfoRow label="License Number" value={profile?.licenseNumber} />
                    <InfoRow label="License State" value={profile?.licenseState} />
                    <InfoRow label="NPI Number" value={profile?.npiNumber} />
                    <InfoRow label="Additional License States" value={additionalStates} />
                </div>

                <p className="text-xs text-text-muted">
                    Include your full name and what needs correcting, and attach supporting
                    documentation where you have it.
                </p>
            </div>
        </Modal>
    );
}
