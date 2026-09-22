"use client";

import { MdBusiness, MdLock } from "react-icons/md";
import Button from "@/components/ui/Button";
import { ProfileCardShell } from "./ProfileCardShell";
import { CustomerInfoRow } from "./CustomerInfoRow";

/**
 * Agency business details: legal name, EIN, trading name and billing email.
 *
 * The authorised contact's legal name sits here too but is read-only — it is
 * VERIFIED_HARD and has no self-service path, so it routes to support via
 * `onViewLockedIdentity` rather than into the edit drawer.
 *
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 * @param {() => void} props.onEdit - Opens the business information drawer.
 * @param {() => void} props.onViewLockedIdentity - Opens the read-only identity modal.
 */
export function BusinessInfoCard({ profile, onEdit, onViewLockedIdentity }) {
    return (
        <ProfileCardShell icon={MdBusiness} title="Business Information" onEdit={onEdit}>
            <div className="space-y-1">
                <CustomerInfoRow label="Agency Legal Name" value={profile?.agencyName} />
                <CustomerInfoRow label="EIN" value={profile?.ein} />
                <CustomerInfoRow label="Trading Name (DBA)" value={profile?.dbaName} />
                <CustomerInfoRow label="Billing Email" value={profile?.billingEmail} />
            </div>

            <div className="mt-4 rounded-lg border border-border-light bg-muted-light p-3">
                <CustomerInfoRow label="Authorised Contact" value={profile?.fullName} />
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-start gap-2 text-xs text-text-muted">
                        <MdLock className="mt-0.5 shrink-0 text-sm" aria-hidden="true" />
                        This name was checked when your account was approved and can&apos;t be
                        changed here.
                    </p>
                    <Button variant="outline" size="sm" onClick={onViewLockedIdentity}>
                        Request a change
                    </Button>
                </div>
            </div>
        </ProfileCardShell>
    );
}
