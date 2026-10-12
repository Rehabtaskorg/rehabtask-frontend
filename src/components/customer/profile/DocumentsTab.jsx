"use client";

import {
    CUSTOMER_TYPES,
    AGENCY_DOCUMENT_SLOTS,
    INDIVIDUAL_DOCUMENT_SLOTS,
} from "@/lib/constants";
import { CustomerDocumentsCard } from "./cards/CustomerDocumentsCard";

/**
 * Documents tab. Resolves which document slots and which stored document
 * relation apply to this account, so the card itself stays type-agnostic.
 *
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 */
export function DocumentsTab({ profile }) {
    const isAgency = profile?.customerType === CUSTOMER_TYPES.AGENCY;

    const slots = isAgency ? AGENCY_DOCUMENT_SLOTS : INDIVIDUAL_DOCUMENT_SLOTS;
    const documents = isAgency
        ? profile?.agencyLicenseDocuments
        : profile?.customerLicenseDocuments;

    return (
        <div className="max-w-3xl">
            <CustomerDocumentsCard
                documents={documents ?? []}
                slots={slots}
                reviewStartedAt={profile?.reviewStartedAt}
                isAgency={isAgency}
            />
        </div>
    );
}
