"use client";

import { CUSTOMER_TYPES } from "@/lib/constants";
import { formatShortDate } from "@/utils/dates";

/**
 * Renders the patient identity block for booking list rows.
 *
 * Agency bookings: patient fullName, gender, Date of Birth from patient record.
 * Individual bookings: customer's own fullName, gender, Date of Birth as the patient.
 *
 * @param {object} props
 * @param {object} [props.patient]   - Patient record (agency bookings)
 * @param {object} [props.customer]  - Customer profile (used for individual fallback)
 */
export function PatientIdentityCell({ patient, customer }) {
    const isAgency = customer?.customerType === CUSTOMER_TYPES.AGENCY;

    if (isAgency && patient) {
        return (
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-text-main">{patient.fullName || "—"}</span>
                {patient.gender && (
                    <span className="text-xs text-text-muted">{patient.gender}</span>
                )}
                {patient.dateOfBirth && (
                    <span className="text-xs text-text-muted">
                        Date of Birth: {formatShortDate(patient.dateOfBirth)}
                    </span>
                )}
            </div>
        );
    }

    const name = customer?.fullName || "—";
    const gender = customer?.gender;
    const dob = customer?.dateOfBirth;

    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-text-main">{name}</span>
            {gender && (
                <span className="text-xs text-text-muted">{gender}</span>
            )}
            {dob && (
                <span className="text-xs text-text-muted">
                    Date of Birth: {formatShortDate(dob)}
                </span>
            )}
        </div>
    );
}