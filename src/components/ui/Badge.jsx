export const BADGE_VARIANTS = {
    SUCCESS: "success",
    WARNING: "warning",
    DANGER: "danger",
    INFO: "info",
    REVIEW: "review",
    NEUTRAL: "neutral",
};

export const BADGE_SIZES = {
    SM: "sm",
    MD: "md",
};

const VARIANT_CLASSES = {
    [BADGE_VARIANTS.SUCCESS]: "bg-emerald-100 text-emerald-700",
    [BADGE_VARIANTS.WARNING]: "bg-amber-100 text-amber-700",
    [BADGE_VARIANTS.DANGER]: "bg-red-100 text-red-700",
    [BADGE_VARIANTS.INFO]: "bg-blue-100 text-blue-700",
    [BADGE_VARIANTS.REVIEW]: "bg-violet-100 text-violet-700",
    [BADGE_VARIANTS.NEUTRAL]: "bg-slate-100 text-slate-600",
};

const SIZE_CLASSES = {
    [BADGE_SIZES.SM]: "px-2 py-0.5 text-xs gap-1",
    [BADGE_SIZES.MD]: "px-2.5 py-1 text-xs gap-1.5",
};

/**
 * Status pill using the app-wide colour vocabulary: emerald for approved or
 * verified, amber for pending or warning, blue for informational and in-review,
 * red for rejected or action-required, violet for the distinct "pending
 * re-review" flag, slate for neutral or incomplete.
 *
 * `variant` carries colour only — never let it be the sole signal of state, the
 * label text (and optionally `icon`) must say what the colour means.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Label text for the pill.
 * @param {keyof typeof VARIANT_CLASSES} [props.variant] - Colour vocabulary key, defaults to `BADGE_VARIANTS.NEUTRAL`.
 * @param {keyof typeof SIZE_CLASSES} [props.size] - Padding preset, defaults to `BADGE_SIZES.SM`.
 * @param {import('react').ReactNode} [props.icon] - Optional leading icon, rendered decoratively.
 * @param {string} [props.title] - Optional native tooltip text.
 * @param {string} [props.className] - Extra classes for the pill.
 */
export function Badge({
    children,
    variant = BADGE_VARIANTS.NEUTRAL,
    size = BADGE_SIZES.SM,
    icon,
    title,
    className = "",
}) {
    const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES[BADGE_VARIANTS.NEUTRAL];
    const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES[BADGE_SIZES.SM];

    return (
        <span
            title={title}
            className={`inline-flex items-center whitespace-nowrap rounded-full font-medium ${variantClass} ${sizeClass} ${className}`}
        >
            {icon && <span aria-hidden="true" className="flex shrink-0 items-center">{icon}</span>}
            {children}
        </span>
    );
}
