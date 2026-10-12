"use client";

import { MdDescription, MdOpenInNew, MdSwapHoriz } from "react-icons/md";
import { FileRow } from "@/components/ui/FileRow";
import Alert from "@/components/ui/Alert";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { DOCUMENT_MIME_TYPES } from "@/lib/constants";
import { formatShortDate } from "@/utils/dates";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { CUSTOMER_KEYS, replaceCustomerDocument, getCustomerDocumentUrl } from "@/services/customer.api";
import { DocumentStatusFlags } from "@/components/therapist/profile/DocumentStatusFlags";
import { ProfileCardShell } from "./ProfileCardShell";

const ACTION_CLASS =
    "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50";

/**
 * Customer document list with always-visible view and replace actions.
 *
 * Deliberately carries no per-document verification pill: unlike the therapist
 * profile, `CustomerProfile` has no `licenseVerified`/`insuranceVerified`
 * equivalent, and `doc.status` is provisioned but never written. Only the real
 * timestamp-derived flags are shown.
 *
 * @param {Object} props
 * @param {Array<Object>} props.documents - Uploaded documents for this account.
 * @param {Array<{ key: string, label: string, required: boolean }>} props.slots - Expected document types, in display order.
 * @param {string|null} [props.reviewStartedAt] - When the current review window opened.
 * @param {boolean} props.isAgency - Routes replace/view calls to the agency or individual endpoint.
 */
export function CustomerDocumentsCard({ documents = [], slots, reviewStartedAt, isAgency }) {
    const {
        fileInputRef,
        viewingDocId,
        replacingDocId,
        isConfirmOpen,
        error,
        handleViewDocument,
        startReplace,
        confirmReplace,
        cancelReplace,
        handleReplaceFileChange,
        clearError,
    } = useDocumentActions({
        replaceFn: (documentId, file) => replaceCustomerDocument(documentId, file, isAgency),
        viewFn: (documentId) => getCustomerDocumentUrl(documentId, isAgency),
        invalidateKey: CUSTOMER_KEYS.profile(),
    });

    return (
        <ProfileCardShell icon={MdDescription} title="Documents">
            {error && (
                <div className="mb-3">
                    <Alert type="error" message={error} onClose={clearError} />
                </div>
            )}

            <div className="space-y-3">
                {slots.map((slot) => {
                    const doc = documents.find((d) => d.documentType === slot.key);

                    if (!doc) {
                        return (
                            <div
                                key={slot.key}
                                className="rounded-xl border border-dashed border-border-light p-3"
                            >
                                <p className="text-sm font-medium text-text-main">{slot.label}</p>
                                <p className="mt-0.5 text-xs text-text-muted">
                                    {slot.required ? "Required — not uploaded" : "Not uploaded"}
                                </p>
                            </div>
                        );
                    }

                    const meta = [
                        slot.label,
                        doc.uploadedAt ? `Uploaded ${formatShortDate(doc.uploadedAt)}` : null,
                    ]
                        .filter(Boolean)
                        .join(" · ");

                    return (
                        <FileRow
                            key={slot.key}
                            fileName={doc.fileName}
                            mimeType={doc.mimeType}
                            meta={meta}
                            footer={
                                <DocumentStatusFlags
                                    uploadedAt={doc.uploadedAt}
                                    reviewStartedAt={reviewStartedAt}
                                    supersedesId={doc.supersedesId}
                                />
                            }
                            actions={
                                <>
                                    <button
                                        type="button"
                                        onClick={() => handleViewDocument(doc.id)}
                                        disabled={viewingDocId === doc.id}
                                        className={ACTION_CLASS}
                                    >
                                        <MdOpenInNew className="text-base" aria-hidden="true" />
                                        {viewingDocId === doc.id ? "Opening..." : "View"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => startReplace(doc.id)}
                                        disabled={replacingDocId === doc.id}
                                        className={ACTION_CLASS}
                                    >
                                        <MdSwapHoriz className="text-base" aria-hidden="true" />
                                        {replacingDocId === doc.id ? "Replacing..." : "Replace"}
                                    </button>
                                </>
                            }
                        />
                    );
                })}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept={DOCUMENT_MIME_TYPES.join(",")}
                onChange={handleReplaceFileChange}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
            />

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={cancelReplace}
                onConfirm={confirmReplace}
                title="Replace this document?"
                message="You'll choose a new file next. The current document is archived and your account is flagged for re-review. You can keep booking and messaging while a reviewer checks it."
                confirmLabel="Choose new file"
            />
        </ProfileCardShell>
    );
}
