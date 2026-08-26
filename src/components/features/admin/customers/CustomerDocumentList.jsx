"use client";

import { useState } from "react";
import { adminCustomersApi } from "@/services/admin.api";
import { formatShortDate } from "@/utils/dates";
import { showToast } from "@/lib/toast";

/**
 * Formats a byte count to a human-readable file size string.
 * @param {number} bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A single document row. Fetches a signed URL on click and opens it in a new tab.
 *
 * @param {{ doc: object, customerUserId: string }} props
 */
function DocumentRow({ doc, customerUserId }) {
    const [loading, setLoading] = useState(false);

    async function handleOpen() {
        setLoading(true);
        try {
            const res = await adminCustomersApi.getDocumentUrl(customerUserId, doc.id);
            const url = res.data.data.signedUrl;
            const win = window.open(url, "_blank");
            if (!win) {
                showToast.error("Your browser blocked the popup. Please allow popups for this site and try again.");
            }
        } catch {
            showToast.error("Could not open document. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-between py-3 border-b border-border-light last:border-0">
            <div className="min-w-0">
                <p className="text-sm font-medium text-text-main truncate">{doc.fileName}</p>
                <p className="text-xs text-text-muted mt-0.5 capitalize">
                    {doc.documentType?.replace(/_/g, " ")} · {formatFileSize(doc.fileSize)} · {formatShortDate(doc.uploadedAt)}
                </p>
            </div>
            <button
                onClick={handleOpen}
                disabled={loading}
                className="ml-4 shrink-0 px-3 py-1.5 text-xs font-semibold border border-border-light text-primary rounded-lg hover:bg-primary/5 transition disabled:opacity-50"
            >
                {loading ? "Opening…" : "View"}
            </button>
        </div>
    );
}

/**
 * List of customer license/compliance documents with signed-URL viewing.
 *
 * @param {{ documents: object[], customerUserId: string }} props
 */
export function CustomerDocumentList({ documents = [], customerUserId }) {
    if (documents.length === 0) {
        return <p className="text-sm text-text-muted py-4">No documents uploaded.</p>;
    }

    return (
        <div>
            {documents.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} customerUserId={customerUserId} />
            ))}
        </div>
    );
}