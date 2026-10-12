"use client";

import { MdPerson, MdLock } from "react-icons/md";
import Button from "@/components/ui/Button";
import { formatShortDate } from "@/utils/dates";
import { ProfileCardShell } from "./ProfileCardShell";
import { CustomerInfoRow } from "./CustomerInfoRow";

/**
 * Individual customer identity block. Both fields shown here are VERIFIED_HARD
 * server-side, so the whole card is read-only and its only action routes to
 * support through the locked identity modal.
 *
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 * @param {() => void} props.onViewLockedIdentity - Opens the read-only identity modal.
 */
export function PersonalInfoCard({ profile, onViewLockedIdentity }) {
    return (
        <ProfileCardShell
            icon={MdPerson}
            title="Personal Information"
            headerAction={
                <Button variant="outline" size="sm" onClick={onViewLockedIdentity}>
                    Request a change
                </Button>
            }
        >
            <div className="space-y-1">
                <CustomerInfoRow label="Full Name" value={profile?.fullName} />
                <CustomerInfoRow
                    label="Date of Birth"
                    value={profile?.dateOfBirth ? formatShortDate(profile.dateOfBirth) : null}
                />
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-border-light bg-muted-light p-3">
                <MdLock className="mt-0.5 shrink-0 text-sm text-text-muted" aria-hidden="true" />
                <p className="text-xs text-text-muted">
                    Your name and date of birth were checked when your account was approved, so they
                    can&apos;t be edited here. Contact support to request a correction.
                </p>
            </div>
        </ProfileCardShell>
    );
}
