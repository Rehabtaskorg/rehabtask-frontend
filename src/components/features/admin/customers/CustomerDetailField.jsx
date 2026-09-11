/**
 * A labelled read-only field used across the admin customer detail sections.
 *
 * @param {{ label: string, value?: string|null }} props
 */
export function CustomerDetailField({ label, value }) {
    return (
        <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
            <p className="text-sm text-text-main mt-0.5">{value || "—"}</p>
        </div>
    );
}
