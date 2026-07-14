"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/messages.api";
import { useAuth } from "./useAuth";
import { useSocketContext } from "@/components/providers/SocketProvider";

/**
 * Retry config for polling queries — backs off on 429 (rate limit) instead of hammering the server
 */
const pollingRetryConfig = {
    retry: (failureCount, error) => {
        if (error?.response?.status === 429) return failureCount < 3;
        if (error?.response?.status === 401) return false;
        return failureCount < 2;
    },
    retryDelay: (attempt, error) => {
        if (error?.response?.status === 429) return Math.min(5000 * 2 ** attempt, 30000);
        return Math.min(1000 * 2 ** attempt, 10000);
    },
};

/**
 * Hook to manage conversation list with polling
 * Use in the message sidebar
 */
export function useConversations(pollInterval) {
    const { connected } = useSocketContext();
    // Fast poll (10s) when socket is disconnected, slow poll (60s) when connected
    const interval = pollInterval ?? (connected ? 60000 : 10000);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const res = await messagesApi.getConversations();
            return res.data.data.conversations;
        },
        refetchInterval: interval,
        refetchIntervalInBackground: false,
        ...pollingRetryConfig,
    });

    const isSessionExpired = error?.response?.status === 401;

    return {
        conversations: data ?? [],
        loading: isLoading,
        error: error ? "Failed to load conversations" : null,
        sessionExpired: isSessionExpired,
        refetch
    };
}

/**
 * Hook to manage messages in an active conversation thread.
 * Phase 3: all sends go through POST /messages/c/:conversationId.
 *
 * @param {string} conversationId - UUID of the DirectConversation
 * @param {number} [pollInterval] - optional poll interval in ms
 * @param {(error: unknown) => void} [onSendError] - called when a send mutation fails, before the optimistic message is marked failed
 */
export function useMessages(conversationId, pollInterval, onSendError) {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { connected } = useSocketContext();
    const resolvedPollInterval = pollInterval ?? (connected ? 60000 : 10000);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const messagesQueryKey = useMemo(
        () => ["messages", conversationId],
        [conversationId]
    );

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: messagesQueryKey,
        queryFn: async () => {
            const res = await messagesApi.getMessages(conversationId, {
                limit: 50,
                order: "asc"
            });
            setHasMore(res.data.data.hasMore ?? false);
            return res.data.data.messages;
        },
        enabled: !!conversationId,
        refetchInterval: resolvedPollInterval,
        refetchIntervalInBackground: false,
        ...pollingRetryConfig,
    });

    // Reset hasMore when switching conversations
    useEffect(() => {
        setHasMore(false);
    }, [conversationId]);

    const isSessionExpired = error?.response?.status === 401;

    // Mark messages as read — fires on open AND when new messages arrive while viewing
    const lastReadCountRef = useRef(0);
    useEffect(() => {
        if (!conversationId || !data) return;

        const unreadFromOthers = data.filter(
            m => m.senderId !== user?.id && !m.readAt && m.type !== "system" && !m.id?.startsWith("optimistic")
        ).length;

        if (unreadFromOthers === 0 || unreadFromOthers === lastReadCountRef.current) return;
        lastReadCountRef.current = unreadFromOthers;

        messagesApi.markAsRead(conversationId)
            .then(() => {
                queryClient.setQueryData(["conversations"], (old) =>
                    old?.map((conv) =>
                        conv.conversationId === conversationId
                            ? { ...conv, unreadCount: 0 }
                            : conv
                    ) ?? []
                );
                queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
            })
            .catch(() => { });

        return () => { lastReadCountRef.current = 0; };
    }, [conversationId, data, user?.id, queryClient]);

    const { mutateAsync: sendMessageMutation } = useMutation({
        mutationFn: ({ content, replyToId }) =>
            messagesApi.sendMessage(conversationId, content.trim(), replyToId || undefined),

        onMutate: async ({ content, replyToId, _replyPreview }) => {
            await queryClient.cancelQueries({ queryKey: messagesQueryKey });
            const previousMessages = queryClient.getQueryData(messagesQueryKey);

            const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const optimisticMessage = {
                id: optimisticId,
                content: content.trim(),
                senderId: user.id,
                sender: { id: user.id },
                createdAt: new Date().toISOString(),
                readAt: null,
                type: "text",
                status: "sending",
                replyToId: replyToId || null,
                replyTo: _replyPreview || null,
            };

            queryClient.setQueryData(messagesQueryKey, (old) =>
                old ? [...old, optimisticMessage] : [optimisticMessage]
            );

            return { previousMessages, optimisticId };
        },

        onSuccess: (res, _content, context) => {
            const serverMessage = res.data.data.message;
            queryClient.setQueryData(messagesQueryKey, (old) =>
                old
                    ? old.map((m) =>
                        m.id === context.optimisticId ? serverMessage : m
                    )
                    : [serverMessage]
            );
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        },

        onError: (error, _vars, context) => {
            queryClient.setQueryData(messagesQueryKey, (old) =>
                old
                    ? old.map((m) =>
                        m.id === context.optimisticId
                            ? { ...m, status: "failed" }
                            : m
                    )
                    : []
            );
            onSendError?.(error);
        },

        onSettled: (_data, error) => {
            if (!error) {
                queryClient.invalidateQueries({ queryKey: messagesQueryKey });
            }
        }
    });

    const sendMessage = useCallback(
        (content, replyToId, replyPreview) => {
            if (!content.trim() || !user) return;
            sendMessageMutation({ content, replyToId, _replyPreview: replyPreview });
        },
        [user, sendMessageMutation]
    );

    const loadOlderMessages = useCallback(async () => {
        if (!hasMore || loadingMore || !conversationId) return;
        const current = queryClient.getQueryData(messagesQueryKey);
        const oldestReal = current?.findLast(m => m.type !== "system" && !m.id?.startsWith("optimistic"));
        if (!oldestReal) return;

        setLoadingMore(true);
        try {
            const res = await messagesApi.getMessages(conversationId, {
                limit: 50,
                order: "asc",
                cursor: oldestReal.id,
            });
            const olderMessages = res.data.data.messages;
            setHasMore(res.data.data.hasMore ?? false);

            if (olderMessages.length > 0) {
                queryClient.setQueryData(messagesQueryKey, (old) =>
                    old ? [...olderMessages, ...old] : olderMessages
                );
            }
        } catch {
            // Silently fail — user can try again
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, conversationId, queryClient, messagesQueryKey]);

    const retryMessage = useCallback(
        (tempId) => {
            const current = queryClient.getQueryData(messagesQueryKey);
            const failedMsg = current?.find((m) => m.id === tempId);
            if (!failedMsg) return;

            queryClient.setQueryData(messagesQueryKey, (old) =>
                old ? old.filter((m) => m.id !== tempId) : []
            );

            sendMessageMutation({ content: failedMsg.content, replyToId: failedMsg.replyToId });
        },
        [queryClient, messagesQueryKey, sendMessageMutation]
    )

    return {
        messages: data ?? [],
        loading: isLoading,
        error: error ? "Failed to load messages" : null,
        sessionExpired: isSessionExpired,
        sendMessage,
        retryMessage,
        refetch,
        hasMore,
        loadOlderMessages,
        loadingMore,
    };
}

/**
 * Hook to get the other party's info for a pending new direct conversation.
 * Phase 3: resolves from the conversations list if a conversation already exists,
 * otherwise fetches basic public info from GET /messages/users/:userId/info.
 *
 * @param {string|null} userId - The other user's ID (null when no pending conversation)
 */
export function useConversationContext(userId) {
    const { conversations } = useConversations();

    const existingConv = userId
        ? conversations.find(c => c.otherUser?.id === userId)
        : null;

    const { data: fetchedInfo, isLoading } = useQuery({
        queryKey: ["userPublicInfo", userId],
        queryFn: async () => {
            const res = await messagesApi.getUserPublicInfo(userId);
            return res.data.data;
        },
        enabled: !!userId && !existingConv,
        staleTime: 5 * 60 * 1000,
    });

    if (existingConv) {
        return { otherUser: existingConv.otherUser, patient: existingConv.patient, loading: false, error: false };
    }

    return {
        otherUser: fetchedInfo ?? null,
        patient: null,
        loading: isLoading,
        error: false,
    };
}

/**
 * Hook to get and poll unread message count
 * Used in the nav badge
 */
export function useUnreadCount(pollInterval) {
    const { connected } = useSocketContext();
    const interval = pollInterval ?? (connected ? 60000 : 15000);

    const { data } = useQuery({
        queryKey: ["unreadCount"],
        queryFn: async () => {
            const res = await messagesApi.getUnreadCount();
            return res.data.data.count;
        },
        refetchInterval: interval,
        ...pollingRetryConfig,
    });

    return data ?? 0;
}
