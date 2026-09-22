"use client";

import { MdPhone } from "react-icons/md";
import { ProfileCardShell } from "./ProfileCardShell";
import { CustomerInfoRow } from "./CustomerInfoRow";
import { CustomerSmsOptInToggle } from "./CustomerSmsOptInToggle";

/**
 * Contact block shared by both customer types: account email, phone and the
 * inline SMS preference. The SMS toggle stays inline because it saves
 * immediately rather than through the drawer form.
 *
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 * @param {() => void} props.onEdit - Opens the contact information drawer.
 */
export function ContactInfoCard({ profile, onEdit }) {
    return (
        <ProfileCardShell icon={MdPhone} title="Contact Information" onEdit={onEdit}>
            <div className="space-y-1">
                <CustomerInfoRow
                    label="Account Email"
                    value={
                        profile?.email ? (
                            <span className="flex flex-col gap-0.5">
                                <span>{profile.email}</span>
                                <span className="text-xs font-normal text-text-muted">
                                    Used to sign in. Contact support to change it.
                                </span>
                            </span>
                        ) : null
                    }
                />
                <CustomerInfoRow label="Phone" value={profile?.phone} />
                <CustomerSmsOptInToggle profile={profile} />
            </div>
        </ProfileCardShell>
    );
}
