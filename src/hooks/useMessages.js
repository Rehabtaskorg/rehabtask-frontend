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
 * Hook to manage messages in an active conversation thread
 * @param {string} contextType - "offer" | "booking"
 * @param {string} contextId - UUID
 */
export function useMessages(contextType, contextId, pollInterval) {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { connected } = useSocketContext();
    const resolvedPollInterval = pollInterval ?? (connected ? 60000 : 10000);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const messagesQueryKey = useMemo(
        () => ["messages", contextType, contextId],
        [contextType, contextId]
    );

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: messagesQueryKey,
        queryFn: async () => {
            const res = await messagesApi.getMessages(contextType, contextId, {
                limit: 50,
                order: "asc"
            });
            setHasMore(res.data.data.hasMore ?? false);
            return res.data.data.messages;
        },
        enabled: !!contextType && !!contextId,
        refetchInterval: resolvedPollInterval,
        refetchIntervalInBackground: false,
        ...pollingRetryConfig,
    });

    // Reset hasMore when switching conversations
    useEffect(() => {
        setHasMore(false);
    }, [contextType, contextId]);

    const isSessionExpired = error?.response?.status === 401;

    // Mark messages as read — fires on open AND when new messages arrive while viewing
    const lastReadCountRef = useRef(0);
    useEffect(() => {
        if (!contextType || !contextId || !data) return;

        // Check if there are messages from others that are unread
        const unreadFromOthers = data.filter(
            m => m.senderId !== user?.id && !m.readAt && m.type !== "system" && !m.id?.startsWith("optimistic")
        ).length;

        // Skip if no unread messages from others, or if count hasn't changed
        if (unreadFromOthers === 0 || unreadFromOthers === lastReadCountRef.current) return;
        lastReadCountRef.current = unreadFromOthers;

        messagesApi.markAsRead(contextType, contextId)
            .then(() => {
                queryClient.setQueryData(["conversations"], (old) =>
                    old?.map((conv) => {
                        const matchesCurrent = conv.currentContext?.type === contextType &&
                            conv.currentContext?.id === contextId;
                        const matchesDirect = contextType === "direct" &&
                            conv.directConversationId === contextId;

                        return (matchesCurrent || matchesDirect)
                            ? { ...conv, unreadCount: 0 }
                            : conv;
                    }) ?? []
                );
                queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
                queryClient.invalidateQueries({ queryKey: ["conversations"] });
            })
            .catch(() => { });

        return () => { lastReadCountRef.current = 0; };
    }, [contextType, contextId, data, user?.id, queryClient]);

    const { mutateAsync: sendMessageMutation } = useMutation({
        mutationFn: (content) =>
            messagesApi.sendMessage({
                content: content.trim(),
                contextType,
                contextId,
            }),

        onMutate: async (content) => {
            // Cancel-in flight polls so they don't overwrite the optimistic message
            await queryClient.cancelQueries({ queryKey: messagesQueryKey });

            // Snapshot current cache for potential rollback
            const previousMessages = queryClient.getQueryData(messagesQueryKey);

            // Build optimistic message
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
            };

            // Append optimistic message to cache
            queryClient.setQueryData(messagesQueryKey, (old) =>
                old ? [...old, optimisticMessage] : [optimisticMessage]
            );

            return { previousMessages, optimisticId };
        },

        onSuccess: (res, _content, context) => {
            const serverMessage = res.data.data.message;
            // Replace optimistic entry with real server message
            queryClient.setQueryData(messagesQueryKey, (old) =>
                old
                    ? old.map((m) =>
                        m.id === context.optimisticId ? serverMessage : m
                    )
                    : [serverMessage]
            );

            // Refresh sidebar and badge
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        },

        onError: (_error, _content, context) => {
            // Don't rollback - mark the optimistic message as failed so user can retry
            queryClient.setQueryData(messagesQueryKey, (old) =>
                old
                    ? old.map((m) =>
                        m.id === context.optimisticId
                            ? { ...m, status: "failed" }
                            : m
                    )
                    : []
            );
        },

        onSettled: (_data, error) => {
            // Only refetch on success — on error, keep the failed optimistic message visible
            // so the user can see the failure state and retry
            if (!error) {
                queryClient.invalidateQueries({ queryKey: messagesQueryKey });
            }
        }
    });

    const sendMessage = useCallback(
        (content) => {
            if (!content.trim() || !user) return;
            sendMessageMutation(content);
        },
        [user, sendMessageMutation]
    );

    const loadOlderMessages = useCallback(async () => {
        if (!hasMore || loadingMore || !contextType || !contextId) return;
        const current = queryClient.getQueryData(messagesQueryKey);
        // Find the oldest real message (not system divider) to use as cursor
        const oldestReal = current?.findLast(m => m.type !== "system" && !m.id?.startsWith("optimistic"));
        if (!oldestReal) return;

        setLoadingMore(true);
        try {
            const res = await messagesApi.getMessages(contextType, contextId, {
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
    }, [hasMore, loadingMore, contextType, contextId, queryClient, messagesQueryKey]);

    const retryMessage = useCallback(
        (tempId) => {
            const current = queryClient.getQueryData(messagesQueryKey);
            const failedMsg = current?.find((m) => m.id === tempId);
            if (!failedMsg) return;

            // Remove the failed entry - onMutate will insert a fresh optimistic one
            queryClient.setQueryData(messagesQueryKey, (old) =>
                old ? old.filter((m) => m.id !== tempId) : []
            );

            sendMessageMutation(failedMsg.content);
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
 * Hook to get the other party's info for a conversation
 * Fetches directly from offer/booking record — works even when no messages exist yet
 * @param {string} contextType - "offer" | "booking"
 * @param {string} contextId - UUID
 */
export function useConversationContext(contextType, contextId) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["conversationContext", contextType, contextId],
        queryFn: async () => {
            const res = await messagesApi.getConversationContext(contextType, contextId);
            return res.data.data;
        },
        enabled: !!contextType && !!contextId,
        staleTime: 5 * 60 * 1000,
    });

    return {
        otherUser: data?.otherUser ?? null,
        patient: data?.patient ?? null,
        loading: isLoading,
        error: !!error,
    }
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