import { MdPerson, MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

/**
 * Reusable Patient Info block for booking/request detail pages.
 * Shows patient name, email, phone with optional agency note (therapist view)
 *
 * @param {object} patient - { fullName, email, phone }
 * @param {string} [note] - Optional note shown below patient info (e.g "This session is
 * managed by an agency")
 */
export default function PatientInfoBlock({ patient, note }) {
    if (!patient) return null;

    return (
        <div className="bg-primary/5  border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
                <MdPerson className="text-primary text-lg" />
                <span className="text-xs font-bold text-text-muted  uppercase tracking-wider">
                    Patient
                </span>
            </div>
            <div className="space-y-1.5">
                <p className="text-sm font-bold text-text-main ">
                    {patient.fullName}
                </p>
                {patient.addressLine1 && (
                    <div className="flex items-center gap-2 text-text-muted ">
                        <MdLocationOn className="text-sm shrink-0" />
                        <span className="text-sm">
                            {patient.addressLine1}{patient.city ? `, ${patient.city}` : ""}{patient.state ? `, ${patient.state}` : ""}
                        </span>
                    </div>
                )}
                {patient.email && (
                    <div className="flex items-center gap-2 text-text-muted ">
                        <MdEmail className="text-sm shrink-0" />
                        <span className="text-sm">{patient.email}</span>
                    </div>
                )}
                {patient.phone && (
                    <div className="flex items-center gap-2 text-text-muted ">
                        <MdPhone className="text-sm shrink-0" />
                        <span className="text-sm">{patient.phone}</span>
                    </div>
                )}
            </div>
            {note && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                    <p className="text-xs italic text-text-muted ">{note}</p>
                </div>
            )}
        </div>
    )

}
