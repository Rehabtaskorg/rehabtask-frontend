"use client";

import { MdEdit } from "react-icons/md";
import Button from "@/components/ui/Button";

/**
 * Flat card shell shared by every customer profile card: icon tile, title, and
 * an optional trailing Edit button. Matches the therapist profile card anatomy.
 *
 * @param {Object} props
 * @param {import('react').ComponentType} props.icon - Icon rendered in the tile.
 * @param {string} props.title - Card heading.
 * @param {() => void} [props.onEdit] - When provided, renders the Edit button.
 * @param {string} [props.editLabel] - Overrides the Edit button text.
 * @param {import('react').ReactNode} [props.headerAction] - Replaces the Edit button entirely.
 * @param {import('react').ReactNode} props.children - Card body.
 */
export function ProfileCardShell({
    icon: Icon,
    title,
    onEdit,
    editLabel = "Edit",
    headerAction,
    children,
}) {
    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="text-xl text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="min-w-0 text-lg font-bold text-text-main">{title}</h3>
                </div>
                {headerAction ??
                    (onEdit ? (
                        <Button variant="outline" size="sm" onClick={onEdit}>
                            <MdEdit className="text-base" aria-hidden="true" />
                            {editLabel}
                        </Button>
                    ) : null)}
            </div>
            {children}
        </div>
    );
}
