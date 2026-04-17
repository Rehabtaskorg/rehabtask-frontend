"use client";

import { useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MdAttachFile, MdClose } from "react-icons/md";
import { bookingsApi } from "@/lib/bookings.api";
import { messagesApi } from "@/lib/messages.api";
import SharedFiles from "@/components/shared/messages/SharedFiles";
import AttachmentsModal from "@/components/shared/messages/AttachmentsModal";
import { showToast } from "@/lib/toast";

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
    "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function BookingSharedFiles({ bookingId, canUpload = false }) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [showAllFiles, setShowAllFiles] = useState(false);

    const { data: convData } = useQuery({
        queryKey: ["booking-conversation", bookingId],
        queryFn: async () => {
            const res = await bookingsApi.getBookingConversation(bookingId);
            return res.data.data;
        },
        enabled: !!bookingId,
        staleTime: 5 * 60 * 1000,
    });

    const conversationId = convData?.conversationId;

    const handleFileSelect = useCallback(async (e) => {
        const files = Array.from(e.target.files || []);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (files.length === 0) return;

        const valid = files.filter((f) => {
            if (!ALLOWED_TYPES.includes(f.type)) {
                showToast.error(`${f.name}: unsupported file type`);
                return false;
            }
            if (f.size > MAX_SIZE) {
                showToast.error(`${f.name}: exceeds 10MB limit`);
                return false;
            }
            return true;
        }).slice(0, MAX_FILES);

        if (valid.length === 0) return;

        setUploading(true);
        try {
            await messagesApi.uploadAttachments(conversationId, valid);
            queryClient.invalidateQueries({ queryKey: ["conversation-attachments", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["messages"] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            showToast.success(`${valid.length} file${valid.length > 1 ? "s" : ""} sent`);
        } catch (err) {
            showToast.error(err.response?.data?.message || "Failed to upload files");
        } finally {
            setUploading(false);
        }
    }, [conversationId, queryClient]);

    if (!conversationId) return null;

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-main dark:text-white flex items-center gap-2">
                    <MdAttachFile className="text-primary text-lg" />
                    Shared Files
                </h3>
                {canUpload && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                        >
                            {uploading ? "Uploading..." : "+ Upload"}
                        </button>
                    </>
                )}
            </div>

            <SharedFiles
                conversationId={conversationId}
                onViewAll={() => setShowAllFiles(true)}
            />

            {showAllFiles && (
                <AttachmentsModal
                    conversationId={conversationId}
                    onClose={() => setShowAllFiles(false)}
                />
            )}
        </div>
    );
}
