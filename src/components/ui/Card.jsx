export const CARD_VARIANTS = {
    DIVIDED: "divided",
    FLAT: "flat",
};

const BASE_CLASS = "bg-card-light border border-border-light rounded-xl";

/**
 * Titled card shell used as the base for profile and detail page sections.
 *
 * With `CARD_VARIANTS.DIVIDED` the title sits in its own bordered header above
 * the body; with `CARD_VARIANTS.FLAT` the title and body share one padded
 * block. Omitting `title` yields a plain bordered container, in which case
 * `action` is ignored since it has no header to live in.
 *
 * @param {Object} props
 * @param {string} [props.title] - Section heading. Omit for an untitled container.
 * @param {import('react').ReactNode} [props.children] - Card body content.
 * @param {import('react').ReactNode} [props.action] - Optional control rendered at the trailing edge of the header.
 * @param {import('react').ReactNode} [props.badge] - Optional status pill rendered beside the title.
 * @param {keyof typeof CARD_VARIANTS[keyof typeof CARD_VARIANTS]} [props.variant] - Layout preset, defaults to `CARD_VARIANTS.DIVIDED`.
 * @param {string} [props.className] - Extra classes for the card container.
 * @param {string} [props.bodyClassName] - Extra classes for the body wrapper.
 */
export function Card({
    title,
    children,
    action,
    badge,
    variant = CARD_VARIANTS.DIVIDED,
    className = "",
    bodyClassName = "",
}) {
    if (!title) {
        return <div className={`${BASE_CLASS} p-5 ${className}`}>{children}</div>;
    }

    const heading = (
        <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-text-main">{title}</h3>
            {badge}
        </div>
    );

    if (variant === CARD_VARIANTS.FLAT) {
        return (
            <div className={`${BASE_CLASS} p-5 ${className}`}>
                <div className="flex items-center justify-between gap-3">
                    {heading}
                    {action}
                </div>
                <div className={`mt-4 ${bodyClassName}`}>{children}</div>
            </div>
        );
    }

    return (
        <div className={`${BASE_CLASS} overflow-hidden ${className}`}>
            <div className="flex items-center justify-between gap-3 border-b border-border-light px-5 py-4">
                {heading}
                {action}
            </div>
            <div className={`p-5 ${bodyClassName}`}>{children}</div>
        </div>
    );
}
