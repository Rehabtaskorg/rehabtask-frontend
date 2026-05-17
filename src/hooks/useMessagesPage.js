"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useConversations, useMessages, useConversationContext } from "./useMessages";
import { useAuth } from "./useAuth";
import { useSocketContext } from "@/components/providers/SocketProvider";
import { messagesApi } from "@/lib/messages.api";
import { getDisplayName } from "@/utils/messages";

/**
 * Encapsulate all shared state logic for the messaging pages.
 *
 * Phase 3 rewrite: URL param is now ?c={conversationId} (just a UUID).
 * No more contextType prefixes. Selection is always by conversationId.
 *
 * @param {string} basePath - e.g '/customer/messages' or '/therapist/messages'
 */
export function useMessagesPage(basePath) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { conversations, loading: convLoading, error: convError, sessionExpired: convSessionExpired, refetch: refetchConversations } = useConversations();
    const { user } = useAuth();

    const [selectedConversation, setSelectedConversation] = useState(null);
    const { joinConversation, leaveConversation } = useSocketContext();

    // Build the `selected` object that drives message fetching and UI display
    const selected = selectedConversation
        ? {
            conversationId: selectedConversation.conversationId || selectedConversation.directConversationId,
            name: getDisplayName(selectedConversation.otherUser),
            // The badge context (booking > offer > direct) for header/sidebar display
            contextType: selectedConversation.currentContext?.type ?? "direct",
            contextId: selectedConversation.currentContext?.id,
        }
        : null;


    // Join/leave Socket.io conversation room when selection changes
    useEffect(() => {
        if (selected?.conversationId) {
            joinConversation(selected.conversationId);
        }
        return () => { leaveConversation(); };
    }, [selected?.conversationId, joinConversation, leaveConversation]);

    const [mobileView, setMobileView] = useState("list");
    const [inputValue, setInputValue] = useState("");

    // Reply-to state: the message being replied to (null = not replying)
    const [replyingTo, setReplyingTo] = useState(null);

    // Scroll trigger — increments on send to force ChatThread to scroll to bottom
    const [scrollTrigger, setScrollTrigger] = useState(0);

    // Track new direct conversation (no DirectConversation exists yet)
    // URL will be ?c=new:{therapistUserId}
    const [pendingDirectRecipientId, setPendingDirectRecipientId] = useState(null);
    const [directSendError, setDirectSendError] = useState(null);
    const directSendingRef = useRef(false);

    // Parse URL param — supports multiple formats:
    //   ?c={conversationId}           — direct UUID (Phase 3)
    //   ?c=new:{userId}               — new direct conversation
    //   ?c=direct:{userId}            — legacy direct conversation link
    //   ?c=offer:{offerId}            — legacy offer context link
    //   ?c=booking:{bookingId}        — legacy booking context link
    const urlParam = searchParams.get("c") ?? null;
    const colonIdx = urlParam?.indexOf(":") ?? -1;
    const urlPrefix = colonIdx > 0 ? urlParam.slice(0, colonIdx) : null;
    const urlSuffix = colonIdx > 0 ? urlParam.slice(colonIdx + 1) : null;

    const isPendingNewDirect = urlPrefix === "new" || urlPrefix === "direct";
    const isLegacyContext = urlPrefix === "offer" || urlPrefix === "booking";

    // For legacy context URLs, resolve to conversationId from the conversations list
    const legacyMatch = isLegacyContext
        ? conversations.find(c => c.currentContext?.type === urlPrefix && c.currentContext?.id === urlSuffix)
        : null;

    const urlConversationId = isPendingNewDirect
        ? null
        : isLegacyContext
            ? legacyMatch?.conversationId ?? null
            : urlParam; // bare UUID

    const pendingUserId = isPendingNewDirect ? urlSuffix : null;

    // For pending direct messages, fetch the recipient's info for sidebar/header display
    const { otherUser: pendingOtherUser } = useConversationContext(pendingUserId);

    // Don't fetch messages when we have a pending direct recipient
    const isPendingDirect = !!pendingDirectRecipientId;
    const {
        messages, loading: msgLoading, error: msgError,
        sendMessage, retryMessage,
        hasMore, loadOlderMessages, loadingMore
    } = useMessages(isPendingDirect ? null : selected?.conversationId);

    // ── URL → Selection sync ────────────────────────────────
    const updateUrlParam = useCallback((value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("c", value);
        } else {
            params.delete("c");
        }
        router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    }, [router, searchParams, basePath]);

    // Auto-select from URL param when conversations load
    useEffect(() => {
        if (convLoading) return;

        // Handle pending new direct conversation
        if (pendingUserId) {
            // Check if a conversation already exists with this user
            const existingConv = conversations.find(c => c.otherUser?.id === pendingUserId);
            if (existingConv) {
                // Found an existing conversation — switch to it
                setSelectedConversation(existingConv);
                setPendingDirectRecipientId(null);
                setMobileView("chat");
                updateUrlParam(existingConv.conversationId);
                return;
            }

            // Build synthetic conversation for the new direct message
            if (!selectedConversation || selectedConversation._pendingRecipientId !== pendingUserId) {
                setSelectedConversation({
                    otherUser: pendingOtherUser || null,
                    patient: null,
                    lastMessage: null,
                    currentContext: { type: "direct", id: null, data: null },
                    conversationId: null,
                    directConversationId: null,
                    unreadCount: 0,
                    updatedAt: new Date().toISOString(),
                    _pendingRecipientId: pendingUserId,
                });
                setPendingDirectRecipientId(pendingUserId);
                setMobileView("chat");
            }
            return;
        }

        // Standard conversationId from URL (or resolved from legacy offer:/booking: URL)
        if (!urlConversationId) return;

        const match = conversations.find(c => c.conversationId === urlConversationId);
        if (match) {
            const alreadySelected = selectedConversation?.conversationId === match.conversationId;
            if (!alreadySelected) {
                setSelectedConversation(match);
                setPendingDirectRecipientId(null);
                setMobileView("chat");

                // If this was a legacy URL, upgrade to conversationId format
                if (isLegacyContext) {
                    updateUrlParam(match.conversationId);
                }
            }
        }
    }, [convLoading, conversations, urlConversationId, pendingUserId, pendingOtherUser]); // eslint-disable-line react-hooks/exhaustive-deps

    // Populate synthetic conversation's otherUser when context API returns
    useEffect(() => {
        if (!pendingDirectRecipientId || !pendingOtherUser) return;
        if (selectedConversation?._pendingRecipientId === pendingDirectRecipientId && !selectedConversation.otherUser) {
            setSelectedConversation(prev => prev ? { ...prev, otherUser: pendingOtherUser } : prev);
        }
    }, [pendingDirectRecipientId, pendingOtherUser]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync selectedConversation with latest polled data (e.g. context upgrades offer → booking)
    useEffect(() => {
        if (!selectedConversation?.conversationId || !conversations.length || pendingDirectRecipientId) return;

        const match = conversations.find(c => c.conversationId === selectedConversation.conversationId);
        if (!match) return;

        const currentCtx = selectedConversation.currentContext;
        const newCtx = match.currentContext;
        if (currentCtx?.type !== newCtx?.type || currentCtx?.id !== newCtx?.id) {
            setSelectedConversation(match);
        }
    }, [conversations, selectedConversation, pendingDirectRecipientId]);

    // Reset input and reply state when switching conversations
    useEffect(() => {
        if (selected?.conversationId) {
            setInputValue("");
            setReplyingTo(null);
        }
    }, [selected?.conversationId]);

    const handleSelectConversation = useCallback((conversation) => {
        setSelectedConversation(conversation);
        setPendingDirectRecipientId(null);
        setMobileView("chat");
        updateUrlParam(conversation.conversationId);
    }, [updateUrlParam]);

    const handleBackToList = useCallback(() => {
        setMobileView("list");
    }, []);

    // Track upload state for the MessageInput spinner
    const [uploading, setUploading] = useState(false);

    const handleSendMessage = useCallback(async (content, files) => {
        const hasText = content?.trim()?.length > 0;
        const hasFiles = files?.length > 0;
        if (!hasText && !hasFiles) return;

        // New direct conversation — use the direct API (text-only, no attachments for first msg)
        if (pendingDirectRecipientId) {
            if (!hasText) return; // First message must have text
            if (directSendingRef.current) return;
            directSendingRef.current = true;

            setDirectSendError(null);
            try {
                const res = await messagesApi.sendDirectMessage(pendingDirectRecipientId, content.trim());
                const message = res.data.data.message;
                const conversationId = message.conversationId;

                queryClient.setQueryData(["messages", conversationId], [message]);

                setPendingDirectRecipientId(null);
                setSelectedConversation(prev => prev ? {
                    ...prev,
                    conversationId,
                    directConversationId: conversationId,
                    _pendingRecipientId: undefined,
                } : prev);

                updateUrlParam(conversationId);
                refetchConversations();
                queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
                setScrollTrigger(t => t + 1);
            } catch (err) {
                console.error("Failed to send direct message:", err);
                setDirectSendError("Failed to send message. Please try again.");
            } finally {
                directSendingRef.current = false;
            }
            return;
        }

        // Attachment upload path — with optimistic message
        if (hasFiles && selected?.conversationId) {
            setUploading(true);
            const convId = selected.conversationId;
            const messagesKey = ["messages", convId];

            // Build optimistic message with local file previews
            const optimisticId = `optimistic-upload-${Date.now()}`;
            const optimisticAttachments = files.map((file, i) => ({
                id: `${optimisticId}-att-${i}`,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                _localPreviewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
            }));
            const optimisticMsg = {
                id: optimisticId,
                content: content?.trim() || "",
                senderId: user?.id,
                sender: { id: user?.id },
                createdAt: new Date().toISOString(),
                readAt: null,
                type: "message",
                status: "sending",
                attachments: optimisticAttachments,
                replyToId: replyingTo?.id || null,
                replyTo: replyingTo ? {
                    id: replyingTo.id,
                    content: replyingTo.content,
                    senderId: replyingTo.senderId,
                    sender: replyingTo.sender,
                } : null,
            };

            // Insert optimistic message into cache immediately
            queryClient.setQueryData(messagesKey, (old) =>
                old ? [...old, optimisticMsg] : [optimisticMsg]
            );

            try {
                await messagesApi.uploadAttachments(convId, files, content?.trim() || "", replyingTo?.id);
                setReplyingTo(null);
                setScrollTrigger(t => t + 1);

                // Clean up local blob URLs
                optimisticAttachments.forEach(a => {
                    if (a._localPreviewUrl) URL.revokeObjectURL(a._localPreviewUrl);
                });

                // Replace optimistic with real data from server
                queryClient.invalidateQueries({ queryKey: messagesKey });
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
                queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
                queryClient.invalidateQueries({ queryKey: ["conversation-attachments", convId] });
                queryClient.invalidateQueries({ queryKey: ["conversation-attachments-modal", convId] });
            } catch (err) {
                console.error("Failed to upload attachments:", err);
                // Mark optimistic message as failed
                queryClient.setQueryData(messagesKey, (old) =>
                    old?.map(m => m.id === optimisticId ? { ...m, status: "failed" } : m) ?? []
                );
                optimisticAttachments.forEach(a => {
                    if (a._localPreviewUrl) URL.revokeObjectURL(a._localPreviewUrl);
                });
                setDirectSendError(err.response?.data?.message || "Failed to upload files. Please try again.");
            } finally {
                setUploading(false);
            }
            return;
        }

        // Standard text-only send
        if (hasText) {
            // Build reply preview for optimistic rendering
            const replyPreview = replyingTo ? {
                id: replyingTo.id,
                content: replyingTo.content,
                senderId: replyingTo.senderId,
                sender: replyingTo.sender,
                attachments: replyingTo.attachments,
            } : null;
            sendMessage(content, replyingTo?.id, replyPreview);
            setReplyingTo(null);
            setScrollTrigger(t => t + 1);
        }
    }, [pendingDirectRecipientId, sendMessage, replyingTo, selected?.conversationId, refetchConversations, updateUrlParam, queryClient, user?.id]);

    return {
        // Data
        user,
        conversations,
        messages,
        selected,
        selectedConversation,

        // Loading / Error
        convLoading,
        convError,
        convSessionExpired,
        msgLoading,
        msgError: directSendError || msgError,

        // UI State
        mobileView,
        inputValue,
        setInputValue,
        uploading,
        replyingTo,
        setReplyingTo,
        scrollTrigger,

        // Pagination
        hasMore,
        loadOlderMessages,
        loadingMore,

        // Actions
        handleSelectConversation,
        handleBackToList,
        handleSendMessage,
        retryMessage
    };
}
