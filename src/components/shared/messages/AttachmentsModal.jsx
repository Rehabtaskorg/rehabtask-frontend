"use client";

import { useState, useEffect, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { messagesApi } from "@/services/message.api";
import { getDisplayName } from "@/utils/messages";
import {
    MdClose, MdDownload, MdDescription, MdInsertDriveFile,
    MdImage, MdFilterList,
} from "react-icons/md";

const isImageType = (mimeType) => mimeType?.startsWith("image/");

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

function DocIcon({ mimeType }) {
    if (mimeType === "application/pdf") return <MdDescription className="text-red-500 text-xl" />;
    if (mimeType?.includes("wordprocessingml")) return <MdDescription className="text-blue-500 text-xl" />;
    return <MdInsertDriveFile className="text-slate-400 text-xl" />;
}

const FILTERS = [
    { key: "all", label: "All" },
    { key: "images", label: "Images" },
    { key: "documents", label: "Documents" },
];

/**
 * Full-screen modal showing all attachments for a conversation.
 * Paginated with infinite scroll, filterable by type.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} conversationId
 */
export default function AttachmentsModal({ isOpen, onClose, conversationId, bookingId }) {
    const [filter, setFilter] = useState("all");
    const [urlLoading, setUrlLoading] = useState({});

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // Escape key closes modal
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    // Paginated query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["conversation-attachments-modal", conversationId, bookingId ?? "all"],
        queryFn: async ({ pageParam }) => {
            const res = await messagesApi.getAttachments(conversationId, {
                limit: 20,
                cursor: pageParam || undefined,
                bookingId,
            });
            const result = res.data.data;
            return { attachments: result?.attachments ?? [], hasMore: result?.hasMore ?? false };
        },
        getNextPageParam: (lastPage) => {
            const items = lastPage?.attachments;
            if (!lastPage?.hasMore || !items?.length) return undefined;
            return items[items.length - 1].id;
        },
        enabled: isOpen && !!conversationId,
    });

    const allAttachments = data?.pages?.flatMap((p) => p?.attachments ?? []) ?? [];

    // Apply client-side filter
    const filtered = filter === "all"
        ? allAttachments
        : filter === "images"
            ? allAttachments.filter((a) => isImageType(a.mimeType))
            : allAttachments.filter((a) => !isImageType(a.mimeType));

    const images = filtered.filter((a) => isImageType(a.mimeType));
    const documents = filtered.filter((a) => !isImageType(a.mimeType));

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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.25 }}
                        className="relative bg-card-light  rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light  shrink-0">
                            <h2 className="text-lg font-bold text-text-main ">
                                Shared Files {allAttachments.length > 0 && `(${allAttachments.length})`}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-text-muted hover:text-text-main  hover:bg-slate-100  transition-colors"
                            >
                                <MdClose className="text-xl" />
                            </button>
                        </div>

                        {/* Filter tabs */}
                        <div className="px-6 pt-4 shrink-0">
                            <div className="flex items-center gap-1 bg-background-light  p-1 rounded-xl w-fit">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                            filter === f.key
                                                ? "bg-card-light  shadow-sm text-primary"
                                                : "text-text-muted  hover:text-text-main "
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="animate-pulse h-14 bg-slate-100  rounded-lg" />
                                    ))}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-12">
                                    <MdFilterList className="text-3xl text-text-muted  mx-auto mb-2" />
                                    <p className="text-sm text-text-muted ">
                                        {filter === "all" ? "No files shared yet." : `No ${filter} found.`}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Images section */}
                                    {(filter === "all" || filter === "images") && images.length > 0 && (
                                        <div>
                                            {filter === "all" && (
                                                <p className="text-[10px] font-bold tracking-widest text-text-muted  mb-3 uppercase">
                                                    Images
                                                </p>
                                            )}
                                            <div className="grid grid-cols-3 gap-2">
                                                {images.map((att) => (
                                                    <ImageGridItem
                                                        key={att.id}
                                                        attachment={att}
                                                        onOpen={handleOpen}
                                                        isLoading={urlLoading[att.id]}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Documents section */}
                                    {(filter === "all" || filter === "documents") && documents.length > 0 && (
                                        <div>
                                            {filter === "all" && (
                                                <p className="text-[10px] font-bold tracking-widest text-text-muted  mb-3 uppercase">
                                                    Documents
                                                </p>
                                            )}
                                            <div className="space-y-1">
                                                {documents.map((att) => (
                                                    <DocumentListItem
                                                        key={att.id}
                                                        attachment={att}
                                                        onOpen={handleOpen}
                                                        isLoading={urlLoading[att.id]}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Load more */}
                                    {hasNextPage && (
                                        <div className="text-center pt-2">
                                            <button
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                className="text-xs font-bold text-primary hover:underline disabled:opacity-50"
                                            >
                                                {isFetchingNextPage ? "Loading..." : "Load more"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* eslint-disable @next/next/no-img-element */
/**
 * Image grid item for the modal — 3-column square thumbnails.
 * Uses <img> instead of next/image because src is a runtime signed URL
 * with an expiring token — next/image requires a static, configurable hostname.
 */
function ImageGridItem({ attachment, onOpen, isLoading }) {
    const [src, setSrc] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        messagesApi.getAttachmentUrl(attachment.id)
            .then((res) => { if (!cancelled) setSrc(res.data.data.signedUrl); })
            .catch(() => { if (!cancelled) setError(true); });
        return () => { cancelled = true; };
    }, [attachment.id]);

    return (
        <button
            onClick={() => onOpen(attachment.id)}
            disabled={isLoading}
            className="aspect-square rounded-lg overflow-hidden bg-slate-100  relative group cursor-pointer"
            title={attachment.fileName}
        >
            {src ? (
                <img src={src} alt={attachment.fileName} className="w-full h-full object-cover" loading="lazy" />
            ) : error ? (
                <div className="w-full h-full flex items-center justify-center">
                    <MdImage className="text-2xl text-slate-400" />
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <MdDownload className="text-white text-lg opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </div>
        </button>
    );
}

/**
 * Document row for the modal — icon, name, size, date, download button
 */
function DocumentListItem({ attachment, onOpen, isLoading }) {
    const uploaderName = attachment.uploadedBy
        ? getDisplayName(attachment.uploadedBy)
        : null;

    return (
        <div
            onClick={() => onOpen(attachment.id)}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-background-light  transition-colors group cursor-pointer"
        >
            <div className="w-10 h-10 flex items-center justify-center bg-primary/5  rounded-lg shrink-0">
                <DocIcon mimeType={attachment.mimeType} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-main  truncate">
                    {attachment.fileName}
                </p>
                <p className="text-[10px] text-text-muted ">
                    {formatFileSize(attachment.fileSize)} · {formatDate(attachment.createdAt)}
                    {uploaderName && ` · ${uploaderName}`}
                </p>
            </div>
            <button
                disabled={isLoading}
                className="opacity-0 group-hover:opacity-100 p-2 text-primary hover:bg-primary/10 rounded-full transition-all shrink-0 disabled:opacity-50"
            >
                <MdDownload className="text-lg" />
            </button>
        </div>
    );
}
