"use client";

import { MdPlace, MdLock } from "react-icons/md";
import { ProfileCardShell } from "./ProfileCardShell";
import { CustomerInfoRow } from "./CustomerInfoRow";

/**
 * Address block shared by both customer types. The only difference between an
 * agency and an individual is the heading, so the caller passes `title` rather
 * than the card branching on customer type.
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 * @param {string} props.title - Card heading, e.g. "Business Address".
 * @param {boolean} props.isLockedForReview - Hides the Edit action while under review.
 * @param {() => void} props.onEdit - Opens the address drawer.
 */
export function AddressCard({ profile, title, isLockedForReview, onEdit }) {
    const cityStateZip = [
        [profile?.city, profile?.state].filter(Boolean).join(", "),
        profile?.zipCode,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <ProfileCardShell
            icon={MdPlace}
            title={title}
            onEdit={isLockedForReview ? undefined : onEdit}
        >
            <div className="space-y-1">
                <CustomerInfoRow label="Address Line 1" value={profile?.addressLine1} />
                <CustomerInfoRow label="Address Line 2" value={profile?.addressLine2} />
                <CustomerInfoRow label="City, State and ZIP" value={cityStateZip} />
            </div>

            {isLockedForReview && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-border-light bg-muted-light p-3">
                    <MdLock className="mt-0.5 shrink-0 text-sm text-text-muted" aria-hidden="true" />
                    <p className="text-xs text-text-muted">
                        Your address can&apos;t be changed while your account is under review. You
                        can update it again once a reviewer has approved your account.
                    </p>
                </div>
            )}
        </ProfileCardShell>
    );
}
