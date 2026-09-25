"use client";

import { CUSTOMER_TYPES } from "@/lib/constants";
import { formatShortDate, calculateAge } from "@/utils/dates";
import { CustomerDetailField } from "./CustomerDetailField";
import { CustomerSectionCard } from "./CustomerSectionCard";

/**
 * Joins the address parts of a customer profile into a single display string.
 * @param {object} profile
 * @returns {string|null}
 */
function formatAddress(profile) {
    return [profile.addressLine1, profile.addressLine2, profile.city, profile.state, profile.zipCode]
        .filter(Boolean).join(", ") || null;
}

/**
 * Identity block for a customer — business details for agencies, patient
 * details for individuals.
 *
 * @param {{ profile: object }} props
 */
export function CustomerIdentitySection({ profile }) {
    const address = formatAddress(profile);

    if (profile.customerType === CUSTOMER_TYPES.AGENCY) {
        return (
            <CustomerSectionCard title="Business Identity">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CustomerDetailField label="Legal name" value={profile.agencyName} />
                    <CustomerDetailField label="DBA" value={profile.dbaName} />
                    <CustomerDetailField label="EIN" value={profile.ein} />
                    <CustomerDetailField label="Billing email" value={profile.billingEmail} />
                    <CustomerDetailField label="Contact name" value={profile.fullName} />
                    <CustomerDetailField label="Phone" value={profile.phone} />
                    <CustomerDetailField label="Address" value={address} />
                </div>
            </CustomerSectionCard>
        );
    }

    const age = calculateAge(profile.dateOfBirth);
    const dobDisplay = profile.dateOfBirth
        ? `${formatShortDate(profile.dateOfBirth)}${age != null ? ` (age ${age})` : ""}`
        : null;

    return (
        <CustomerSectionCard title="Patient Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomerDetailField label="Full name" value={profile.fullName} />
                <CustomerDetailField label="Date of birth" value={dobDisplay} />
                <CustomerDetailField label="Primary diagnosis" value={profile.primaryDiagnosis} />
                <CustomerDetailField label="Referring provider" value={profile.referringProviderName} />
                <CustomerDetailField label="Phone" value={profile.phone} />
                <CustomerDetailField label="Address" value={address} />
            </div>
        </CustomerSectionCard>
    );
}
