"use client";

import { useMemo, useEffect } from "react";
import { MdClose, MdAdd, MdDescription, MdInsertDriveFile } from "react-icons/md";

const isImageType = (type) => type?.startsWith("image/");

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function DocIcon({ type }) {
    if (type === "application/pdf") return <MdDescription className="text-red-500 text-lg" />;
    if (type?.includes("wordprocessingml")) return <MdDescription className="text-blue-500 text-lg" />;
    return <MdInsertDriveFile className="text-slate-400 text-lg" />;
}

/* eslint-disable @next/next/no-img-element */
/**
 * Upload preview bar — shows staged files before sending.
 * Rendered above the message input when files are selected.
 * Uses <img> with blob URLs (URL.createObjectURL) for local file previews —
 * next/image does not support blob: URLs.
 *
 * @param {File[]} files - Staged files
 * @param {function} onRemove - Called with index to remove a file
 * @param {function} onAddMore - Opens file picker to add more files
 */
export default function UploadPreview({ files, onRemove, onAddMore }) {
    // Create blob URLs once per file list change — inline URL.createObjectURL()
    // in render leaks memory because each render creates a new URL that is never revoked.
    const previewUrls = useMemo(
        () => files.map(f => (isImageType(f.type) ? URL.createObjectURL(f) : null)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [files]
    );

    useEffect(() => {
        return () => previewUrls.forEach(url => url && URL.revokeObjectURL(url));
    }, [previewUrls]);

    if (!files || files.length === 0) return null;

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const canAddMore = files.length < 5;

    return (
        <div className="px-3 md:px-6 pt-3 bg-card-light  border-t border-border-light ">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
                    {files.map((file, idx) => (
                        <div key={`${file.name}-${idx}`} className="relative flex-shrink-0">
                            {isImageType(file.type) ? (
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 ">
                                    <img
                                        src={previewUrls[idx]}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-14 h-14 rounded-lg bg-background-light  border border-border-light  flex flex-col items-center justify-center gap-0.5">
                                    <DocIcon type={file.type} />
                                    <span className="text-[8px] font-bold text-text-muted  uppercase truncate max-w-[48px]">
                                        {file.name.split(".").pop()}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => onRemove(idx)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                                aria-label={`Remove ${file.name}`}
                            >
                                <MdClose className="text-xs" />
                            </button>
                        </div>
                    ))}

                    {/* Add more button */}
                    {canAddMore && (
                        <button
                            onClick={onAddMore}
                            className="w-14 h-14 flex-shrink-0 rounded-lg border-2 border-dashed border-border-light  flex items-center justify-center text-text-muted  hover:border-primary hover:text-primary transition-colors"
                            aria-label="Add more files"
                        >
                            <MdAdd className="text-xl" />
                        </button>
                    )}
                </div>

                <div className="text-[10px] font-bold text-primary whitespace-nowrap shrink-0">
                    {files.length} file{files.length !== 1 ? "s" : ""} · {formatFileSize(totalSize)}
                </div>
            </div>
        </div>
    );
}
