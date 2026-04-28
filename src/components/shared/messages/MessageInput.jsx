"use client";

import { useRef, useState, useCallback } from "react";
import UploadPreview from "./UploadPreview";
import ReplyPreview from "./ReplyPreview";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * MessageInput with attachment support.
 *
 * onSend signature: (content: string, files?: File[])
 * - When files are present, the parent handles the upload API call
 * - When no files, the parent uses the standard text-only send path
 */
export default function MessageInput({ inputValue, setInputValue, onSend, placeholder = "Type a message...", uploading = false, replyingTo = null, onCancelReply }) {
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [stagedFiles, setStagedFiles] = useState([]);
    const [fileError, setFileError] = useState(null);

    const hasContent = inputValue.trim().length > 0 || stagedFiles.length > 0;

    const validateAndAddFiles = useCallback((newFiles) => {
        setFileError(null);
        const currentCount = stagedFiles.length;
        const available = MAX_FILES - currentCount;

        if (available <= 0) {
            setFileError(`Maximum ${MAX_FILES} files per message.`);
            return;
        }

        const toAdd = [];
        for (const file of Array.from(newFiles).slice(0, available)) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setFileError(`"${file.name}" — invalid type. Allowed: images, PDF, DOCX.`);
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                setFileError(`"${file.name}" — too large. Max 10MB per file.`);
                continue;
            }
            // Duplicate check by name+size
            const isDuplicate = stagedFiles.some(f => f.name === file.name && f.size === file.size);
            if (isDuplicate) continue;

            toAdd.push(file);
        }

        if (toAdd.length > 0) {
            setStagedFiles(prev => [...prev, ...toAdd]);
        }
    }, [stagedFiles]);

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files?.length > 0) {
            validateAndAddFiles(e.target.files);
        }
        // Reset input so the same file can be re-selected after removal
        e.target.value = "";
    };

    const handleRemoveFile = (index) => {
        setStagedFiles(prev => prev.filter((_, i) => i !== index));
        setFileError(null);
    };

    const handleSend = (e) => {
        e?.preventDefault();
        if (!hasContent || uploading) return;

        const content = inputValue;
        const files = stagedFiles.length > 0 ? [...stagedFiles] : undefined;

        // Clear state immediately for snappy UX
        setInputValue("");
        setStagedFiles([]);
        setFileError(null);
        if (inputRef.current) inputRef.current.style.height = "auto";

        onSend(content, files);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Drag and drop support
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files?.length > 0) {
            validateAndAddFiles(e.dataTransfer.files);
        }
    };

    return (
        <div
            className={`shrink-0 ${dragOver ? "ring-2 ring-primary ring-inset" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Reply preview bar */}
            <ReplyPreview message={replyingTo} onCancel={onCancelReply} />

            {/* Upload preview bar */}
            <UploadPreview
                files={stagedFiles}
                onRemove={handleRemoveFile}
                onAddMore={handleAttachClick}
            />

            {/* File error */}
            {fileError && (
                <div className="px-3 md:px-6 pt-2 bg-card-light dark:bg-card-dark">
                    <p className="text-[11px] text-red-500 font-medium">{fileError}</p>
                </div>
            )}

            {/* Input area */}
            <div className="px-3 md:px-6 py-3 border-t border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
                <div className="flex items-end gap-2 md:gap-3">
                    {/* Attach button */}
                    <button
                        type="button"
                        onClick={handleAttachClick}
                        disabled={uploading}
                        className="flex items-center justify-center h-11 w-11 rounded-full text-text-muted dark:text-gray-500 hover:bg-muted-light dark:hover:bg-muted-dark hover:text-primary transition-colors shrink-0 disabled:opacity-40"
                        aria-label="Add attachment"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>

                    {/* Input field */}
                    <div className="flex-1 min-w-0 rounded-2xl border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={stagedFiles.length > 0 ? "Add a message (optional)..." : placeholder}
                            rows={1}
                            maxLength={2000}
                            disabled={uploading}
                            className="w-full resize-none border-none bg-transparent focus:outline-none focus:ring-0 text-sm text-text-main dark:text-white placeholder:text-text-muted dark:placeholder:text-gray-500 px-4 py-3 leading-relaxed disabled:opacity-50"
                            style={{ minHeight: "44px", maxHeight: "120px" }}
                            onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }}
                        />
                    </div>

                    {/* Send button */}
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!hasContent || uploading}
                        className="flex items-center justify-center h-11 w-11 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg"
                        aria-label="Send message"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-between px-12 mt-1.5">
                    <span className="text-[10px] text-text-muted dark:text-gray-500">
                        {uploading ? "Uploading..." : "Enter to send · Shift+Enter for new line"}
                    </span>
                    <span className="text-[10px] text-text-muted dark:text-gray-500">{inputValue.length}/2000</span>
                </div>
            </div>
        </div>
    );
}
