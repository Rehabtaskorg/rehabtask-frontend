export default function PatientBadge({ patient }) {
    if (!patient) return null;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            Patient: {patient.fullName}
        </span>
    );
}