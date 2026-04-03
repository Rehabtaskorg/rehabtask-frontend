"use client";

import { useState, useCallback, useEffect } from "react";
import { messagesApi } from "@/lib/messages.api";
import { MdDownload, MdDescription, MdInsertDriveFile, MdImage, MdOpenInNew } from "react-icons/md";

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
 * Image thumbnail that opens the full-size image on click.
 * Supports two modes:
 * - localPreviewUrl: used for optimistic messages (sender sees local file immediately)
 * - attachment.id: fetches signed URL on mount (receiver/normal load)
 */
function ImageThumbnail({ attachment, openAttachment, isLoading }) {
    const [imgSrc, setImgSrc] = useState(attachment._localPreviewUrl || null);
    const [imgError, setImgError] = useState(false);

    // Auto-fetch signed URL on mount (skip if we already have a local preview)
    useEffect(() => {
        if (imgSrc || imgError || !attachment.id) return;
        let cancelled = false;
        messagesApi.getAttachmentUrl(attachment.id)
            .then((res) => { if (!cancelled) setImgSrc(res.data.data.signedUrl); })
            .catch(() => { if (!cancelled) setImgError(true); });
        return () => { cancelled = true; };
    }, [attachment.id]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <button
            onClick={() => openAttachment(attachment.id)}
            disabled={isLoading}
            className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 hover:opacity-90 transition-opacity cursor-pointer group"
            title={attachment.fileName}
        >
            {imgSrc ? (
                <img
                    src={imgSrc}
                    alt={attachment.fileName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : imgError ? (
                <div className="w-full h-full flex items-center justify-center">
                    <MdImage className="text-2xl text-slate-400" />
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <MdOpenInNew className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
        </button>
    );
}

/**
 * Document row — file icon, name, size, download button
 */
function DocumentRow({ attachment, openAttachment, isLoading, isSender }) {
    return (
        <button
            onClick={() => openAttachment(attachment.id)}
            disabled={isLoading}
            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors w-full text-left ${
                isSender
                    ? "bg-white/10 hover:bg-white/20 border border-white/10"
                    : "bg-background-light dark:bg-background-dark hover:bg-slate-100 dark:hover:bg-slate-700 border border-border-light dark:border-border-dark"
            }`}
            title={`Download ${attachment.fileName}`}
        >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                isSender ? "bg-white/15" : "bg-primary/10"
            }`}>
                <DocIcon mimeType={attachment.mimeType} />
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