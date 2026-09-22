"use client";

import { MdContactPhone, MdLock } from "react-icons/md";
import { formatShortDate } from "@/utils/dates";
import { InfoRow } from "./InfoRow";

const US_STATE_SEPARATOR = ", ";


function formatAddress(profile) {
    const street = [profile?.addressLine1, profile?.addressLine2].filter(Boolean).join(US_STATE_SEPARATOR);
    const region = [profile?.city, profile?.state].filter(Boolean).join(US_STATE_SEPARATOR);
    const tail = [region, profile?.zipCode].filter(Boolean).join(" ");

    return [street, tail].filter(Boolean).join(US_STATE_SEPARATOR) || null;
}


export function ContactDetailsCard({ profile }) {
    const address = formatAddress(profile);
    const emergencyContact = [profile?.emergencyContactName, profile?.emergencyContactPhone]
        .filter(Boolean)
        .join(" · ");

    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                    <MdContactPhone className="text-xl text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-main">Contact &amp; Address</h3>
                    <p className="text-sm text-text-muted">
                        Details from your application. Contact support to change any of these.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <InfoRow label="Home Address" value={address} />
                <InfoRow label="Emergency Contact" value={emergencyContact || null} />
                <InfoRow
                    label="Date of Birth"
                    value={profile?.dateOfBirth ? formatShortDate(profile.dateOfBirth) : null}
                    icon={<MdLock className="text-sm" />}
                />
                <InfoRow
                    label="Home Visits"
                    value={profile?.doesHomeVisits ? "Available for home visits" : "Not offering home visits"}
                />
            </div>
        </div>
    );
}
