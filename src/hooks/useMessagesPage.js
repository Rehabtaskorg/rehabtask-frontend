"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useConversations, useMessages, useConversationContext } from "./useMessages";
import { useAuth } from "./useAuth";
import { useSocketContext } from "@/components/providers/SocketProvider";
import { messagesApi } from "@/lib/messages.api";
import { getDisplayName, parseContextParam } from "@/utils/messages";

/**
 * Resolve URL context param to a conversation selection.
 * For 'direct:{id}', the id may be a DirectConversation UUID or a therapist userId.
 */
function resolveDirectParam(contextParam, conversations) {
    if (!contextParam || contextParam.type !== 'direct') return null;

    // 1. Check if any conversation's directConversationId matches
    const byDirectId = conversations.find(
        (c) => c.directConversationId === contextParam.id
    );
    if (byDirectId) return byDirectId;

    // 2. Check if any conversation's currentContext matches exactly
    const byContext = conversations.find(
        (c) => c.currentContext?.type === 'direct' && c.currentContext?.id === contextParam.id
    );
    if (byContext) return byContext;

    // 3. Check if the id is a userId (therapist) — match by otherUser.id
    const byUserId = conversations.find(
        (c) => c.otherUser?.id === contextParam.id
    );
    if (byUserId) return byUserId;

    return null; // No match — need synthetic conversation
}

/**
 * Encapsulate all shared state logic for the messaging pages.
 * @param {string} - e.g '/customer/messages' or '/therapist/messages'
 */
export function useMessagesPage(basePath) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { conversations, loading: convLoading, error: convError, sessionExpired: convSessionExpired, refetch: refetchConversations } = useConversations();
    const { user } = useAuth();

    const [selectedConversation, setSelectedConversation] = useState(null);
    const { joinConversation, leaveConversation } = useSocketContext();

    // For direct conversations, prefer using the directConversationId for merged thread view
    // `selected.type` / `selected.id` drive which messages to fetch (always direct for merged threads)
    // `selected.contextType` is the actual conversation context (booking/offer/direct) for UI display
    const selected = selectedConversation
        ? (() => {
            const contextType = selectedConversation.currentContext?.type ?? 'direct';
            // If conversation has a directConversationId, use it for the merged thread
            if (selectedConversation.directConversationId) {
                return {
                    type: 'direct',
                    id: selectedConversation.directConversationId,
                    name: getDisplayName(selectedConversation.otherUser),
                    contextType,
                    contextId: selectedConversation.currentContext?.id,
                };
            }
            return {
                type: contextType,
                id: selectedConversation.currentContext?.id,
                name: getDisplayName(selectedConversation.otherUser),
                contextType,
                contextId: selectedConversation.currentContext?.id,
            };
        })()
        : null;

    // Join/leave Socket.io conversation room when selection changes
    useEffect(() => {
        if (selected?.type && selected?.id) {
            joinConversation(selected.type, selected.id);
        }
        return () => { leaveConversation(); };
    }, [selected?.type, selected?.id, joinConversation, leaveConversation]);
    const [mobileView, setMobileView] = useState('list');
    const [inputValue, setInputValue] = useState('');

    // Track whether this is a new direct conversation (no DirectConversation exists yet)
    // In this case, the URL param is direct:{therapistUserId} and we need special send handling
    const [pendingDirectRecipientId, setPendingDirectRecipientId] = useState(null);
    const [directSendError, setDirectSendError] = useState(null);
    // Ref to prevent double-send race: once the first direct message is in flight, block further direct sends
    const directSendingRef = useRef(false);

    // Parse URL context param for fallback lookup
    const urlContextParam = parseContextParam(searchParams.get('c'));

    const { otherUser: urlOtherUser, patient: urlPatient, loading: urlContextLoading } = useConversationContext(
        urlContextParam?.type ?? null,
        urlContextParam?.id ?? null
    );

    // Don't fetch messages when we have a pending direct recipient (no DirectConversation exists yet)
    const isPendingDirect = !!pendingDirectRecipientId;
    const { messages, loading: msgLoading, error: msgError, sendMessage, retryMessage, hasMore, loadOlderMessages, loadingMore } = useMessages(
        isPendingDirect ? null : selected?.type,
        isPendingDirect ? null : selected?.id
    );

    // ── URL ↔ Selection sync ────────────────────────────────
    const updateUrlParam = useCallback((type, id) => {
        const params = new URLSearchParams(searchParams.toString());
        if (type && id) {
            params.set('c', `${type}:${id}`);
        } else {
            params.delete('c');
        }
        router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    }, [router, searchParams, basePath]);

    // Auto-select from URL param when conversations load
    useEffect(() => {
        if (convLoading) return;

        const contextParam = parseContextParam(searchParams.get('c'));
        if (!contextParam) return;

        // Special handling for direct context
        if (contextParam.type === 'direct') {
            const match = resolveDirectParam(contextParam, conversations);

            if (match) {
                // Found existing conversation — select it
                // Guard: skip if already selected (compare by directConversationId for merged threads, or currentContext.id for standard)
                const alreadySelected = selectedConversation && (
                    (match.directConversationId && selectedConversation.directConversationId === match.directConversationId) ||
                    (!match.directConversationId && selectedConversation.currentContext?.id === match.currentContext?.id)
                );
                if (!alreadySelected) {
                    setSelectedConversation(match);
                    setPendingDirectRecipientId(null);
                    setMobileView('chat');

                    // Update URL to use direct conversation ID if we matched by userId
                    if (match.directConversationId && contextParam.id !== match.directConversationId) {
                        updateUrlParam('direct', match.directConversationId);
                    }
                }
                return;
            }

            // No match — this is a new direct conversation to a therapist userId
            // Build a synthetic conversation while we wait for the first message
            // Skip if selectedConversation already has this directConversationId (first message just sent, waiting for refetch)
            if (selectedConversation?.directConversationId === contextParam.id) return;
            if (!selectedConversation || selectedConversation._pendingRecipientId !== contextParam.id) {
                const syntheticConversation = {
                    otherUser: urlOtherUser || null,
                    patient: null,
                    lastMessage: null,
                    currentContext: { type: 'direct', id: contextParam.id, data: null },
                    unreadCount: 0,
                    updatedAt: new Date().toISOString(),
                    _pendingRecipientId: contextParam.id,
                };
                setSelectedConversation(syntheticConversation);
                setPendingDirectRecipientId(contextParam.id);
                setMobileView('chat');
            }
            return;
        }

        // Standard offer/booking handling
        const match = conversations.find(
            (c) => c.currentContext?.type === contextParam.type && c.currentContext?.id === contextParam.id
        );

        if (match) {
            // Update if: no selection, different context, OR real data now available
            // (e.g. a synthetic was created first but the real conversation has directConversationId for merged thread)
            const isDifferent = !selectedConversation || selectedConversation.currentContext?.id !== match.currentContext?.id;
            const hasNewDirectData = !selectedConversation?.directConversationId && match.directConversationId;

            if (isDifferent || hasNewDirectData) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedConversation(match);
                setMobileView('chat');

                // If this conversation has a direct thread, switch URL to the merged view
                if (match.directConversationId) {
                    updateUrlParam('direct', match.directConversationId);
                }
            }
            return;
        }

        // Fallback: URL has a valid context but it's not in the conversations list
        // (e.g. new user with no messages yet). Build a synthetic conversation from the context API.
        if (!match && !urlContextLoading && urlOtherUser && contextParam) {
            const syntheticConversation = {
                otherUser: urlOtherUser,
                patient: urlPatient ?? null,
                lastMessage: null,
                currentContext: { type: contextParam.type, id: contextParam.id, data: null },
                unreadCount: 0,
                updatedAt: new Date().toISOString(),
            };
            if (!selectedConversation || selectedConversation.currentContext?.id !== contextParam.id) {
                setSelectedConversation(syntheticConversation);
                setMobileView('chat');
            }
        }
    }, [convLoading, conversations, searchParams, urlContextLoading, urlOtherUser, urlPatient]); // eslint-disable-line react-hooks/exhaustive-deps

    // Populate synthetic conversation's otherUser when context API returns data
    useEffect(() => {
        if (!pendingDirectRecipientId || !urlOtherUser) return;
        if (selectedConversation?._pendingRecipientId === pendingDirectRecipientId && !selectedConversation.otherUser) {
            setSelectedConversation(prev => prev ? { ...prev, otherUser: urlOtherUser } : prev);
        }
    }, [pendingDirectRecipientId, urlOtherUser]); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync selectedConversation with latest polled data
    // When conversations refresh (e.g. context upgrades from offer → booking),
    // update the selected state so the header, sidebar, and widget reflect the change
    useEffect(() => {
        if (!selectedConversation || !conversations.length || pendingDirectRecipientId) return;

        // Find the matching conversation in the latest polled data
        let match = null;
        if (selectedConversation.directConversationId) {
            match = conversations.find(c => c.directConversationId === selectedConversation.directConversationId);
        }
        if (!match && selectedConversation.currentContext?.id) {
            match = conversations.find(c => c.currentContext?.id === selectedConversation.currentContext.id);
        }
        if (!match && selectedConversation.otherUser?.id) {
            match = conversations.find(c => c.otherUser?.id === selectedConversation.otherUser.id);
        }

        if (!match) return;

        // Check if context has changed (e.g. offer → booking upgrade)
        const currentCtx = selectedConversation.currentContext;
        const newCtx = match.currentContext;
        const contextChanged = currentCtx?.type !== newCtx?.type || currentCtx?.id !== newCtx?.id;
        // Also sync if directConversationId was added (conversation got merged)
        const directIdAdded = !selectedConversation.directConversationId && match.directConversationId;

        if (contextChanged || directIdAdded) {
            setSelectedConversation(match);
        }
    }, [conversations, selectedConversation, pendingDirectRecipientId]);

    // Reset input when switching conversations
    useEffect(() => {
        if (selected?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInputValue('');
        }
    }, [selected?.id]);

    const handleSelectConversation = useCallback((conversation) => {
        setSelectedConversation(conversation);
        setPendingDirectRecipientId(null);
        setMobileView('chat');

        // For conversations with directConversationId, route to the direct merged thread
        if (conversation.directConversationId) {
            updateUrlParam('direct', conversation.directConversationId);
        } else {
            updateUrlParam(conversation.currentContext?.type, conversation.currentContext?.id);
        }
    }, [updateUrlParam]);

    const handleBackToList = useCallback(() => {
        setMobileView('list');
    }, []);

    const handleSendMessage = useCallback(async (content) => {
        if (!content.trim()) return;

        // If this is a new direct conversation (no DirectConversation yet), use the direct API
        if (pendingDirectRecipientId) {
            // Prevent double-send race — ref check is synchronous, unlike state
            if (directSendingRef.current) return;
            directSendingRef.current = true;

            setDirectSendError(null);
            try {
                const res = await messagesApi.sendDirectMessage(pendingDirectRecipientId, content.trim());
                const message = res.data.data.message;
                const conversationId = message.conversationId;

                // Seed the messages cache with the sent message so it appears immediately
                queryClient.setQueryData(["messages", "direct", conversationId], [message]);

                // Clear the pending state and update selectedConversation to a proper object
                // with directConversationId so the URL sync effect won't re-enter pending state
                setPendingDirectRecipientId(null);
                setSelectedConversation(prev => prev ? {
                    ...prev,
                    directConversationId: conversationId,
                    _pendingRecipientId: undefined,
                } : prev);

                // Update URL to the real DirectConversation ID
                updateUrlParam('direct', conversationId);

                // Refresh conversations to pick up the new one (don't await — let it happen in background)
                refetchConversations();
                queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
            } catch (err) {
                console.error("Failed to send direct message:", err);
                setDirectSendError("Failed to send message. Please try again.");
            } finally {
                directSendingRef.current = false;

            }
            return;
        }

        // Standard send
        sendMessage(content);
    }, [pendingDirectRecipientId, sendMessage, refetchConversations, updateUrlParam, queryClient]);

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