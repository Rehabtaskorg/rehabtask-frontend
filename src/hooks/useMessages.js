"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/messages.api";
import { useAuth } from "./useAuth";

/**
 * Hook to manage conversation list with polling
 * Use in the message sidebar
 */
export function useConversations(pollInterval = 10000) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            const res = await messagesApi.getConversations();
            return res.data.data.conversations;
        },
        refetchInterval: pollInterval,
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
export function useMessages(contextType, contextId, pollInterval = 5000) {
    const queryClient = useQueryClient();
    const { user } = useAuth();

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
            return res.data.data.messages;
        },
        enabled: !!contextType && !!contextId,
        refetchInterval: pollInterval,
    });

    const isSessionExpired = error?.response?.status === 401;

    // Mark as read when conversation opens
    useEffect(() => {
        if (contextType && contextId) {
            messagesApi.markAsRead(contextType, contextId).catch(() => { });
        }
    }, [contextType, contextId]);

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

        onSettled: () => {
            // Resume polling / sync ground truth
            queryClient.invalidateQueries({ queryKey: messagesQueryKey });
        }
    });

    const sendMessage = useCallback(
        (content) => {
            if (!content.trim() || !user) return;
            sendMessageMutation(content);
        },
        [user, sendMessageMutation]
    );

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
        refetch
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
export function useUnreadCount(pollInterval = 15000) {
    const { data } = useQuery({
        queryKey: ["unreadCount"],
        queryFn: async () => {
            const res = await messagesApi.getUnreadCount();
            return res.data.data.count;
        },
        refetchInterval: pollInterval
    });

    return data ?? 0;
}