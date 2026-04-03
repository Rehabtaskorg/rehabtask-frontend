"use client";

import { useState, useCallback } from "react";
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
 * Image thumbnail that opens the full-size image on click
 */
function ImageThumbnail({ attachment, openAttachment, isLoading }) {
    const [imgSrc, setImgSrc] = useState(null);
    const [imgError, setImgError] = useState(false);

    // Lazy-load the signed URL for the thumbnail preview
    const loadPreview = useCallback(async () => {
        if (imgSrc || imgError) return;
        try {
            const res = await messagesApi.getAttachmentUrl(attachment.id);
            setImgSrc(res.data.data.signedUrl);
        } catch {
            setImgError(true);
        }
    }, [attachment.id, imgSrc, imgError]);

    return (
        <button
            onClick={() => openAttachment(attachment.id)}
            onMouseEnter={loadPreview}
            onFocus={loadPreview}
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
 * Renders image thumbnails in a grid and documents as rows.
 *
 * @param {Array} attachments - Array of attachment objects from the message
 * @param {boolean} isSender - Whether the current user sent this message
 */
export default function MessageAttachments({ attachments, isSender }) {
    const { openAttachment, loading } = useAttachmentUrl();

    if (!attachments || attachments.length === 0) return null;

    const images = attachments.filter((a) => isImageType(a.mimeType));
    const documents = attachments.filter((a) => !isImageType(a.mimeType));

    // Determine image grid columns based on count
    const gridCols = images.length === 1
        ? "grid-cols-1"
        : "grid-cols-2";

    return (
        <div className="space-y-2 mt-2">
            {/* Image grid */}
            {images.length > 0 && (
                <div className={`grid ${gridCols} gap-1.5`}>
                    {images.slice(0, 4).map((img, idx) => (
                        <div key={img.id} className="relative">
                            <ImageThumbnail
                                attachment={img}
                                openAttachment={openAttachment}
                                isLoading={loading[img.id]}
                            />
                            {/* +N overlay on the 4th image if there are more */}
                            {idx === 3 && images.length > 4 && (
                                <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center pointer-events-none">
                                    <span className="text-white font-bold text-lg">+{images.length - 4}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Document rows */}
            {documents.length > 0 && (
                <div className="space-y-1.5">
                    {documents.map((doc) => (
                        <DocumentRow
                            key={doc.id}
                            attachment={doc}
                            openAttachment={openAttachment}
                            isLoading={loading[doc.id]}
                            isSender={isSender}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}