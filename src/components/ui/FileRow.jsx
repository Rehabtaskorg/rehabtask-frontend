import { MdDescription, MdImage, MdInsertDriveFile } from "react-icons/md";
import { Badge, BADGE_VARIANTS } from "@/components/ui/Badge";

const ICON_TILE_CLASSES = {
    pdf: "bg-red-100 text-red-600",
    image: "bg-emerald-100 text-emerald-600",
    document: "bg-blue-100 text-blue-600",
    generic: "bg-slate-100 text-slate-500",
};

const resolveFileKind = (mimeType) => {
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType?.startsWith("image/")) return "image";
    if (mimeType?.includes("wordprocessingml") || mimeType?.startsWith("text/")) return "document";
    return "generic";
};

const KIND_ICONS = {
    pdf: MdDescription,
    image: MdImage,
    document: MdDescription,
    generic: MdInsertDriveFile,
};

/**
 * Mime-coloured icon tile matching the shared-files row anatomy.
 *
 * @param {Object} props
 * @param {string} [props.mimeType] - File mime type used to pick icon and colour.
 */
export function FileRowIcon({ mimeType }) {
    const kind = resolveFileKind(mimeType);
    const Icon = KIND_ICONS[kind];

    return (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${ICON_TILE_CLASSES[kind]}`}>
            <Icon className="text-lg" aria-hidden="true" />
        </div>
    );
}

/**
 * Document row for credential and compliance files: mime-coloured icon tile,
 * filename, a metadata line, a persistent status pill and an always-visible
 * action slot.
 *
 * Actions are deliberately never hover-revealed — a credential action must stay
 * reachable by keyboard and on touch devices, so callers should pass real
 * buttons in `actions` rather than styling them to appear on hover.
 *
 * @param {Object} props
 * @param {string} props.fileName - Display name of the file.
 * @param {string} [props.mimeType] - Drives the icon tile colour and glyph.
 * @param {string} [props.meta] - Secondary line, e.g. "Insurance · 240 KB · Uploaded Aug 22, 2026".
 * @param {string} [props.statusLabel] - Status pill text. Omit to render no pill.
 * @param {keyof typeof BADGE_VARIANTS[keyof typeof BADGE_VARIANTS]} [props.statusVariant] - Pill colour, defaults to `BADGE_VARIANTS.NEUTRAL`.
 * @param {import('react').ReactNode} [props.actions] - Always-visible controls rendered at the trailing edge.
 * @param {import('react').ReactNode} [props.footer] - Optional content under the metadata line, e.g. review flags.
 * @param {string} [props.className] - Extra classes for the row container.
 */
export function FileRow({
    fileName,
    mimeType,
    meta,
    statusLabel,
    statusVariant = BADGE_VARIANTS.NEUTRAL,
    actions,
    footer,
    className = "",
}) {
    return (
        <div
            className={`flex flex-col gap-3 rounded-xl border border-border-light p-3 ${className}`}
        >
            <div className="flex min-w-0 items-start gap-3">
                <FileRowIcon mimeType={mimeType} />
                <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-text-main">{fileName}</p>
                    {meta && <p className="mt-0.5 text-xs text-text-muted">{meta}</p>}
                    {footer && <div className="mt-1">{footer}</div>}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {statusLabel && <Badge variant={statusVariant}>{statusLabel}</Badge>}
                {actions}
            </div>
        </div>
    );
}
