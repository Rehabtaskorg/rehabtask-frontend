"use client";

import { MdMedicalInformation } from "react-icons/md";
import { ProfileCardShell } from "./ProfileCardShell";
import { CustomerInfoRow } from "./CustomerInfoRow";

/**
 * Individual customer medical details. Both fields are VERIFIED_SOFT, so edits
 * send the account for a light re-review without suspending anything — the
 * drawer says so at the point of saving.
 *
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 * @param {() => void} props.onEdit - Opens the medical information drawer.
 */
export function MedicalInfoCard({ profile, onEdit }) {
    return (
        <ProfileCardShell icon={MdMedicalInformation} title="Medical Information" onEdit={onEdit}>
            <div className="space-y-1">
                <CustomerInfoRow label="Primary Diagnosis" value={profile?.primaryDiagnosis} />
                <CustomerInfoRow
                    label="Referring Provider"
                    value={profile?.referringProviderName}
                />
            </div>

            <p className="mt-4 text-xs text-text-muted">
                Shared with a therapist only once you have a confirmed booking with them.
            </p>
        </ProfileCardShell>
    );
}
