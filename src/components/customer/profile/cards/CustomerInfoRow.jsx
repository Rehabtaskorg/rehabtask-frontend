/**
 * Label-over-value row used throughout the customer profile cards. Renders an
 * em dash when the value is empty so rows never collapse.
 *
 * @param {Object} props
 * @param {string} props.label - Field name shown above the value.
 * @param {import('react').ReactNode} [props.value] - Field value, falls back to "—".
 * @param {import('react').ReactNode} [props.icon] - Optional leading icon.
 */
export function CustomerInfoRow({ label, value, icon }) {
    return (
        <div className="flex items-start gap-3 py-2">
            {icon && <span className="mt-0.5 text-text-muted">{icon}</span>}
            <div className="min-w-0 flex-1">
                <p className="text-sm text-text-muted">{label}</p>
                <p className="wrap-break-word text-base font-medium text-text-main">
                    {value || "—"}
                </p>
            </div>
        </div>
    );
}
