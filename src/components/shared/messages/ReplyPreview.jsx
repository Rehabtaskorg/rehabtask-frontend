"use client";

import { MdClose, MdReply, MdAttachFile } from "react-icons/md";
import { getDisplayName } from "@/utils/messages";

/**
 * Compact reply preview bar shown above the message input.
 * Shows who is being replied to and a truncated content preview.
 *
 * @param {Object} message - The message being replied to
 * @param {function} onCancel - Called to dismiss the reply
 */
export default function ReplyPreview({ message, onCancel }) {
    if (!message) return null;

    const senderName = getDisplayName(message.sender) || "Unknown";
    const hasAttachments = message.attachments?.length > 0;
    const previewText = message.content
        ? message.content.slice(0, 100) + (message.content.length > 100 ? "..." : "")
        : hasAttachments
            ? `${message.attachments[0].fileName}`
            : "Message";

    return (
        <div className="px-3 md:px-6 pt-3 bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-primary/5 dark:bg-primary/10 border-l-3 border-primary">
                <MdReply className="text-primary text-lg shrink-0 rotate-180" />
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-primary">{senderName}</p>
                    <p className="text-xs text-text-muted dark:text-gray-400 truncate">
                        {hasAttachments && !message.content && (
                            <MdAttachFile className="inline text-xs mr-0.5 -mt-0.5" />
                        )}
                        {previewText}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-1 rounded-full text-text-muted hover:text-text-main dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    aria-label="Cancel reply"
                >
                    <MdClose className="text-base" />
                </button>
            </div>
        </div>
    );
}
