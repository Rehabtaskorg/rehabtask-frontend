"use client";

import { useState, useCallback } from "react";
import { messagesApi } from "@/lib/messages.api";
import { MdDownload, MdDescription, MdInsertDriveFile, MdImage } from "react-icons/md";

/**
 * Determine if a MIME type is an image
 */
const isImageType = (mimeType) =>
    mimeType?.startsWith("image/");

/**
 * Get an appropriate icon for a document type
 */
function DocIcon({ mimeType, className = "text-lg" }) {
    if (mimeType === "application/pdf") {
        return <MdDescription className={`text-red-500 ${className}`} />;
    }
    if (mimeType?.includes("wordprocessingml")) {
        return <MdDescription className={`text-blue-500 ${className}`} />;
    }
    return <MdInsertDriveFile className={`text-slate-400 ${className}`} />;
}

/**
 * Format file size for display
 */
const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Get file extension from filename
 */
const getExtension = (fileName) => {
    const idx = fileName?.lastIndexOf(".");
    return idx > 0 ? fileName.slice(idx + 1).toUpperCase() : "";
};

/**
 * Hook to manage signed URL fetching with caching
 */
function useAttachmentUrl() {
    const [loading, setLoading] = useState({});

    const openAttachment = useCallback(async (attachmentId) => {
        if (loading[attachmentId]) return;
        setLoading((prev) => ({ ...prev, [attachmentId]: true }));
        try {
            const res = await messagesApi.getAttachmentUrl(attachmentId);
            const { signedUrl } = res.data.data;
            window.open(signedUrl, "_blank", "noopener,noreferrer");
        } catch {
            // Silently fail — user can click again
        } finally {
            setLoading((prev) => ({ ...prev, [attachmentId]: false }));
        }
    }, [loading]);

    return { openAttachment, loading };
}


/**
 * Main attachment renderer for MessageBubble.
 * All attachments (images + documents) render as uniform compact rows.
 * Sidebar and modal still use thumbnails — this is chat-bubble only.
 *
 * @param {Array} attachments - Array of attachment objects from the message
 * @param {boolean} isSender - Whether the current user sent this message
 */
export default function MessageAttachments({ attachments, isSender }) {
    const { openAttachment, loading } = useAttachmentUrl();

    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="space-y-1.5 mt-2">
            {attachments.map((att) => (
                <AttachmentRow
                    key={att.id}
                    attachment={att}
                    openAttachment={openAttachment}
                    isLoading={loading[att.id]}
                    isSender={isSender}
                />
            ))}
        </div>
    );
}

/**
 * Unified attachment row — works for both images and documents.
 * Compact: icon + filename + size/type + download arrow.
 */
function AttachmentRow({ attachment, openAttachment, isLoading, isSender }) {
    return (
        <button
            onClick={() => openAttachment(attachment.id)}
            disabled={isLoading}
            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors w-full text-left ${
                isSender
                    ? "bg-white/10 hover:bg-white/20 border border-white/10"
                    : "bg-background-light dark:bg-background-dark hover:bg-slate-100 dark:hover:bg-slate-700 border border-border-light dark:border-border-dark"
            }`}
            title={`Open ${attachment.fileName}`}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isSender ? "bg-white/15" : "bg-primary/10"
            }`}>
                {isImageType(attachment.mimeType)
                    ? <MdImage className="text-emerald-500 text-lg" />
                    : <DocIcon mimeType={attachment.mimeType} />
                }
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold truncate ${
                    isSender ? "text-white" : "text-text-main dark:text-white"
                }`}>
                    {attachment.fileName}
                </p>
                <p className={`text-[10px] ${
                    isSender ? "text-white/70" : "text-text-muted dark:text-gray-400"
                }`}>
                    {formatFileSize(attachment.fileSize)} · {getExtension(attachment.fileName)}
                </p>
            </div>
            <MdDownload className={`text-sm shrink-0 ${
                isSender ? "text-white/60" : "text-text-muted dark:text-gray-500"
            }`} />
        </button>
    );
}