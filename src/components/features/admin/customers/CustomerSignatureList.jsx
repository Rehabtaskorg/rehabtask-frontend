"use client";

import { CUSTOMER_TYPES } from "@/lib/constants";
import { formatShortDate } from "@/utils/dates";

/**
 * Agency compliance signature row — documentType, signedAt, signedText preview.
 * @param {{ sig: object }} props
 */
function AgencySignatureRow({ sig }) {
    return (
        <div className="py-3 border-b border-border-light last:border-0">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-main capitalize">
                    {sig.documentType?.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-text-muted">{formatShortDate(sig.signedAt)}</p>
            </div>
            {sig.signedText && (
                <p className="text-xs text-text-muted mt-1 line-clamp-2">{sig.signedText}</p>
            )}
        </div>
    );
}

/**
 * Individual consent signature row — includes representative details for proxy-signed consents.
 * @param {{ sig: object }} props
 */
function IndividualSignatureRow({ sig }) {
    const isProxy = !!sig.representativeName;

    return (
        <div className="py-3 border-b border-border-light last:border-0">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-text-main capitalize">
                    {sig.documentType?.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-text-muted">{formatShortDate(sig.signedAt)}</p>
            </div>
            {isProxy && (
                <div className="mt-1.5 bg-amber-50 border border-amber-200 rounded px-3 py-2 space-y-0.5">
                    <p className="text-xs font-medium text-amber-800">Signed by representative</p>
                    <p className="text-xs text-amber-700">Name: {sig.representativeName}</p>
                    {sig.representativeRelationship && (
                        <p className="text-xs text-amber-700">Relationship: {sig.representativeRelationship}</p>
                    )}
                    {sig.representativeAuthority && (
                        <p className="text-xs text-amber-700">Authority: {sig.representativeAuthority}</p>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Renders the signature list for a customer, branching on customerType.
 * Agency customers show compliance signatures; individual customers show consent signatures
 * with representative authority details for proxy-signed consents.
 *
 * Signatures will be empty until the backend onboarding flow captures them — renders an
 * empty state in that case rather than hiding the section.
 *
 * @param {{ signatures: object[], customerType: string }} props
 */
export function CustomerSignatureList({ signatures = [], customerType }) {
    if (signatures.length === 0) {
        return <p className="text-sm text-text-muted py-4">No signatures on file.</p>;
    }

    return (
        <div>
            {signatures.map((sig) =>
                customerType === CUSTOMER_TYPES.AGENCY
                    ? <AgencySignatureRow key={sig.id} sig={sig} />
                    : <IndividualSignatureRow key={sig.id} sig={sig} />
            )}
        </div>
    );
}