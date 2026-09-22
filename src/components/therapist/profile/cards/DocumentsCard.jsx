"use client";

import { MdDescription, MdOpenInNew, MdSwapHoriz } from "react-icons/md";
import { FileRow } from "@/components/ui/FileRow";
import { BADGE_VARIANTS } from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { DOCUMENT_MIME_TYPES, LICENSE_DOCUMENT_TYPES, INSURANCE_DOCUMENT_TYPES } from "@/lib/constants";
import { formatShortDate } from "@/utils/dates";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { DocumentStatusFlags } from "../DocumentStatusFlags";

const ACTION_CLASS =
    "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50";

/**
 * Resolves the verification pill for one document from the profile-level flag
 * that actually applies to its type. Returns `null` for document types with no
 * matching flag (identity, compliance, etc.) rather than borrowing an unrelated
 * one — a government ID has no license or insurance verification status.
 *
 * @param {string} documentType
 * @param {Object} profile
 * @param {boolean} [profile.licenseVerified]
 * @param {boolean} [profile.insuranceVerified]
 * @returns {{ label: string, variant: string }|null}
 */
function resolveVerificationStatus(documentType, profile) {
    if (LICENSE_DOCUMENT_TYPES.includes(documentType)) {
        return profile?.licenseVerified
            ? { label: "Verified", variant: BADGE_VARIANTS.SUCCESS }
            : { label: "Pending review", variant: BADGE_VARIANTS.WARNING };
    }

    if (INSURANCE_DOCUMENT_TYPES.includes(documentType)) {
        return profile?.insuranceVerified
            ? { label: "Verified", variant: BADGE_VARIANTS.SUCCESS }
            : { label: "Pending review", variant: BADGE_VARIANTS.WARNING };
    }

    return null;
}

/**
 * License documents list with always-visible view and replace actions.
 *
 * The status pill reflects the profile-level `licenseVerified`/`insuranceVerified`
 * flags rather than `doc.status`, which is provisioned but never written by the
 * backend. Each document only gets the pill that actually applies to its type —
 * a document with no matching flag (e.g. a government ID) gets none at all.
 *
 * @param {Object} props
 * @param {Object} props.profile - Therapist profile, supplies `licenseDocuments` and review timestamps.
 * @param {import('react').ReactNode} [props.footerAction] - Optional control rendered below the list.
 */
export function DocumentsCard({ profile, footerAction }) {
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
    } = useDocumentActions();

    const documents = profile?.licenseDocuments ?? [];

    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                    <MdDescription className="text-xl text-primary" />
                </div>
                <h3 className="text-lg font-bold text-text-main">License Documents</h3>
            </div>

            {error && (
                <div className="mb-3">
                    <Alert type="error" message={error} onClose={clearError} />
                </div>
            )}

            {documents.length > 0 ? (
                <div className="space-y-3">
                    {documents.map((doc) => {
                        const verification = resolveVerificationStatus(doc.documentType, profile);

                        return (
                            <FileRow
                                key={doc.id}
                                fileName={doc.fileName}
                                mimeType={doc.mimeType}
                                meta={doc.uploadedAt ? `Uploaded ${formatShortDate(doc.uploadedAt)}` : undefined}
                                statusLabel={verification?.label}
                                statusVariant={verification?.variant}
                                footer={
                                    <DocumentStatusFlags
                                        uploadedAt={doc.uploadedAt}
                                        reviewStartedAt={profile?.reviewStartedAt}
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
            ) : (
                <p className="py-4 text-center text-sm text-text-muted">No documents uploaded</p>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={DOCUMENT_MIME_TYPES.join(",")}
                onChange={handleReplaceFileChange}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
            />

            {footerAction}

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={cancelReplace}
                onConfirm={confirmReplace}
                title="Replace this document?"
                message="You'll choose a new file next. The current document is archived and your profile is flagged for re-review, which does not affect your visibility or bookings."
                confirmLabel="Choose new file"
            />
        </div>
    );
}
