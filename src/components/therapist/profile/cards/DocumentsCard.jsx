"use client";

import { MdDescription, MdOpenInNew, MdSwapHoriz } from "react-icons/md";
import { FileRow } from "@/components/ui/FileRow";
import { BADGE_VARIANTS } from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import { DOCUMENT_MIME_TYPES } from "@/lib/constants";
import { formatShortDate } from "@/utils/dates";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { DocumentStatusFlags } from "../DocumentStatusFlags";

const ACTION_CLASS =
    "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50";

/**
 * License documents list with always-visible view and replace actions.
 *
 * The status pill reflects the profile-level `licenseVerified` flag rather than
 * `doc.status`, which is provisioned but never written by the backend.
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
        error,
        handleViewDocument,
        startReplace,
        handleReplaceFileChange,
        clearError,
    } = useDocumentActions();

    const documents = profile?.licenseDocuments ?? [];
    const isVerified = !!profile?.licenseVerified;

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
                    {documents.map((doc) => (
                        <FileRow
                            key={doc.id}
                            fileName={doc.fileName}
                            mimeType={doc.mimeType}
                            meta={doc.uploadedAt ? `Uploaded ${formatShortDate(doc.uploadedAt)}` : undefined}
                            statusLabel={isVerified ? "Verified" : "Pending review"}
                            statusVariant={isVerified ? BADGE_VARIANTS.SUCCESS : BADGE_VARIANTS.WARNING}
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
                    ))}
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
        </div>
    );
}
