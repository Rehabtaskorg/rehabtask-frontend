import { MdPerson, MdEmail, MdPhone } from "react-icons/md";
import { formatShortDate } from "@/utils/dates";

/**
 * Reusable patient identifier card for booking detail pages.
 * Shows name, DOB, gender, cert period, agency, clinician, and discipline.
 *
 * @param {object} props
 * @param {{ fullName: string, email?: string, phone?: string, dateOfBirth?: string, gender?: string, certificationStart?: string, certificationEnd?: string, agency?: { agencyName?: string } }} props.patient
 * @param {{ fullName?: string, primaryLicenseType?: string }} [props.therapist] - Booking-level clinician info
 * @param {string} [props.note]
 */
export function PatientInfoBlock({ patient, therapist, note }) {
    if (!patient) return null;

    const certPeriod =
        patient.certificationStart && patient.certificationEnd
            ? `${formatShortDate(patient.certificationStart)} – ${formatShortDate(patient.certificationEnd)}`
            : null;

    const rows = [
        patient.dateOfBirth && { label: "DOB", value: formatShortDate(patient.dateOfBirth) },
        patient.gender && { label: "Gender", value: patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) },
        certPeriod && { label: "Cert Period", value: certPeriod },
        patient.agency?.agencyName && { label: "Agency", value: patient.agency.agencyName },
        therapist?.fullName && { label: "Clinician", value: therapist.fullName },
        therapist?.primaryLicenseType && { label: "Discipline", value: therapist.primaryLicenseType },
        patient.email && { label: "Email", value: patient.email, icon: <MdEmail className="text-sm shrink-0" /> },
        patient.phone && { label: "Phone", value: patient.phone, icon: <MdPhone className="text-sm shrink-0" /> },
    ].filter(Boolean);

    return (
        <div className="bg-primary/5  border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
                <MdPerson className="text-primary text-lg" />
                <span className="text-xs font-bold text-text-muted  uppercase tracking-wider">Patient</span>
            </div>
            <p className="text-sm font-bold text-text-main  mb-2">{patient.fullName}</p>
            {rows.length > 0 && (
                <dl className="space-y-1.5">
                    {rows.map(({ label, value, icon }) => (
                        <div key={label} className="flex items-start gap-2">
                            {icon && <span className="text-text-muted  mt-0.5">{icon}</span>}
                            <dt className="text-xs text-text-muted  shrink-0 w-20">{label}</dt>
                            <dd className="text-xs text-text-main  font-medium leading-snug">{value}</dd>
                        </div>
                    ))}
                </dl>
            )}
            {note && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                    <p className="text-xs italic text-text-muted ">{note}</p>
                </div>
            )}
        </div>
    );
}
