"use client";

import { MdPlace } from "react-icons/md";
import { ProfileCardShell } from "./ProfileCardShell";
import { CustomerInfoRow } from "./CustomerInfoRow";

/**
 * Address block shared by both customer types. The only difference between an
 * agency and an individual is the heading, so the caller passes `title` rather
 * than the card branching on customer type.
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 * @param {string} props.title - Card heading, e.g. "Business Address".
 * @param {() => void} props.onEdit - Opens the address drawer.
 */
export function AddressCard({ profile, title, onEdit }) {
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
            onEdit={onEdit}
        >
            <div className="space-y-1">
                <CustomerInfoRow label="Address Line 1" value={profile?.addressLine1} />
                <CustomerInfoRow label="Address Line 2" value={profile?.addressLine2} />
                <CustomerInfoRow label="City, State and ZIP" value={cityStateZip} />
            </div>

        </ProfileCardShell>
    );
}
