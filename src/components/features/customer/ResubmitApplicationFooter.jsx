"use client";

import ConfirmModal from "@/components/ui/ConfirmModal";

/**
 * Resubmit control block shared by the agency and individual review screens.
 * The button stays disabled until something has actually changed.
 *
 * @param {{
 *   note: string,
 *   isNoteVisible: boolean,
 *   isConfirmOpen: boolean,
 *   isDirty: boolean,
 *   isSubmitting: boolean,
 *   onOpenConfirm: () => void,
 *   onCloseConfirm: () => void,
 *   onConfirm: () => void,
 *   onToggleNote: () => void,
 *   onNoteChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
 * }} props
 */
export function ResubmitApplicationFooter({
    note,
    isNoteVisible,
    isConfirmOpen,
    isDirty,
    isSubmitting,
    onOpenConfirm,
    onCloseConfirm,
    onConfirm,
    onToggleNote,
    onNoteChange,
}) {
    return (
        <section className="border-t border-border-light pt-6 space-y-4">
            <div className="space-y-2">
                <button
                    type="button"
                    onClick={onOpenConfirm}
                    disabled={!isDirty || isSubmitting}
                    className="h-11 px-6 bg-primary text-white font-bold rounded-lg transition-all hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Resubmit application
                </button>
                <p className="text-xs text-text-muted">
                    {isDirty
                        ? "We'll send your updated application back to our review team."
                        : "Replace at least one document, or add a note, before resubmitting."}
                </p>
            </div>

            <div className="space-y-2">
                <button
                    type="button"
                    onClick={onToggleNote}
                    aria-expanded={isNoteVisible}
                    className="text-sm font-semibold text-primary underline hover:no-underline"
                >
                    Nothing changed? Tell us why
                </button>

                {isNoteVisible && (
                    <div className="space-y-1">
                        <label htmlFor="resubmit-note" className="block text-sm font-semibold text-text-main">
                            Note for the review team
                        </label>
                        <textarea
                            id="resubmit-note"
                            value={note}
                            onChange={onNoteChange}
                            maxLength={500}
                            rows={4}
                            className="w-full rounded-lg border border-border-light bg-card-light p-3 text-sm text-text-main focus:border-primary focus:outline-none"
                            placeholder="Explain what you'd like our team to look at again."
                        />
                        <p className="text-xs text-text-muted">{note.length}/500 characters</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={onCloseConfirm}
                onConfirm={onConfirm}
                loading={isSubmitting}
                title="Resubmit for review?"
                message="Our team will review your updated application within 2–5 business days. You won't be able to make further changes while it's under review."
                confirmLabel="Yes, resubmit"
                cancelLabel="Keep editing"
            />
        </section>
    );
}