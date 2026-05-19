"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { messagesApi } from "@/lib/messages.api";
import { MdDescription, MdInsertDriveFile, MdImage, MdDownload } from "react-icons/md";

const isImageType = (mimeType) => mimeType?.startsWith("image/");

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatRelativeDate = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
};

function DocIcon({ mimeType }) {
    if (mimeType === "application/pdf") return <MdDescription className="text-red-500 text-lg" />;
    if (mimeType?.includes("wordprocessingml")) return <MdDescription className="text-blue-500 text-lg" />;
    return <MdInsertDriveFile className="text-slate-400 text-lg" />;
}

/**
 * Sidebar shared files section.
 * Shows the 3 most recent attachments with a "View all" link.
 *
 * @param {string} conversationId - DirectConversation UUID
 * @param {function} onViewAll - Called when "View all" is clicked (opens modal)
 * @param {string} [bookingId] - When provided, only shows files from this booking
 */
export default function SharedFiles({ conversationId, onViewAll, bookingId }) {
    const { data, isLoading } = useQuery({
        queryKey: ["conversation-attachments", conversationId, bookingId ?? "all"],
        queryFn: async () => {
            const res = await messagesApi.getAttachments(conversationId, { limit: 3, bookingId });
            const result = res.data.data;
            return { attachments: result?.attachments ?? [], hasMore: result?.hasMore ?? false };
        },
        enabled: !!conversationId,
        staleTime: 30 * 1000,
    });

    const [urlLoading, setUrlLoading] = useState({});

    const handleOpen = useCallback(async (attachmentId) => {
        if (urlLoading[attachmentId]) return;
        setUrlLoading((prev) => ({ ...prev, [attachmentId]: true }));
        try {
            const res = await messagesApi.getAttachmentUrl(attachmentId);
            window.open(res.data.data.signedUrl, "_blank", "noopener,noreferrer");
        } catch {
            // Silently fail
        } finally {
            setUrlLoading((prev) => ({ ...prev, [attachmentId]: false }));
        }
    }, [urlLoading]);

    const attachments = data?.attachments ?? [];
    const hasMore = data?.hasMore ?? false;
    const totalCount = attachments.length + (hasMore ? "+" : "");

    // Don't render the section if there are no attachments and not loading
    if (!isLoading && attachments.length === 0) return null;

    return (
        <div className="mt-6 space-y-3">
            <p className="text-text-muted dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Shared Files {attachments.length > 0 && `(${totalCount})`}
            </p>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 p-3 h-12" />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {attachments.map((att) => (
                        <button
                            key={att.id}
                            onClick={() => handleOpen(att.id)}
                            disabled={urlLoading[att.id]}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full text-left group"
                        >
                            {isImageType(att.mimeType) ? (
                                <ImageThumb attachmentId={att.id} fileName={att.fileName} />
                            ) : (
                                <div className="w-10 h-10 flex items-center justify-center bg-background-light dark:bg-background-dark rounded-lg shrink-0">
                                    <DocIcon mimeType={att.mimeType} />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-text-main dark:text-white truncate">
                                    {att.fileName}
                                </p>
                                <p className="text-[10px] text-text-muted dark:text-gray-400">
                                    {formatFileSize(att.fileSize)} · {formatRelativeDate(att.createdAt)}
                                </p>
                            </div>
                            <MdDownload className="text-sm text-text-muted dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                    ))}
                </div>
            )}

            {/* View all link */}
            {(hasMore || attachments.length > 0) && onViewAll && (
                <button
                    onClick={onViewAll}
                    className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-border-light dark:border-border-dark"
                >
                    VIEW ALL
                </button>
            )}
        </div>
    );
}

/* eslint-disable @next/next/no-img-element */
/**
 * Small image thumbnail for the sidebar — lazy loads signed URL.
 * Uses <img> instead of next/image because src is a runtime signed URL
 * with an expiring token — next/image requires a static, configurable hostname.
 */
function ImageThumb({ attachmentId, fileName }) {
    const [src, setSrc] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        messagesApi.getAttachmentUrl(attachmentId)
            .then((res) => {
                if (!cancelled) setSrc(res.data.data.signedUrl);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            });
        return () => { cancelled = true; };
    }, [attachmentId]);

    return (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            {src ? (
                <img src={src} alt={fileName} className="w-full h-full object-cover" loading="lazy" />
            ) : error ? (
                <div className="w-full h-full flex items-center justify-center">
                    <MdImage className="text-slate-400 text-sm" />
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}
