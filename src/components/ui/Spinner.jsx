export const SPINNER_SIZES = {
    SM: "sm",
    MD: "md",
    LG: "lg",
};

const SIZE_CLASSES = {
    [SPINNER_SIZES.SM]: "h-4 w-4 border-2",
    [SPINNER_SIZES.MD]: "h-8 w-8 border-[3px]",
    [SPINNER_SIZES.LG]: "h-12 w-12 border-4",
};

/**
 * Spinning progress indicator for in-flight work, sized to sit inline inside a
 * button (`SPINNER_SIZES.SM`) or standalone in a panel (`md`/`lg`).
 *
 * Use this for actions already in progress; for first paint of a list or card
 * prefer a skeleton placeholder, which preserves layout and avoids a spinner
 * flash. Colour comes from `currentColor`, so the spinner inherits the text
 * colour of whatever it sits in.
 *
 * @param {Object} props
 * @param {keyof typeof SIZE_CLASSES} [props.size] - Diameter preset, defaults to `SPINNER_SIZES.MD`.
 * @param {string} [props.label] - Accessible status text announced to screen readers.
 * @param {boolean} [props.isCentered] - Wraps the spinner in a full-width centred flex row.
 * @param {string} [props.className] - Extra classes for the spinner element.
 */
export function Spinner({
    size = SPINNER_SIZES.MD,
    label = "Loading",
    isCentered = false,
    className = "",
}) {
    const spinner = (
        <span
            role="status"
            aria-live="polite"
            className={`inline-block animate-spin rounded-full border-current border-t-transparent align-[-0.125em] ${SIZE_CLASSES[size] ?? SIZE_CLASSES[SPINNER_SIZES.MD]} ${className}`}
        >
            <span className="sr-only">{label}</span>
        </span>
    );

    if (!isCentered) return spinner;

    return <div className="flex w-full items-center justify-center">{spinner}</div>;
}
