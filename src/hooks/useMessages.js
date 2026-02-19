"use client";

import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/messages.api";

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

    return {
        conversations: data ?? [],
        loading: isLoading,
        error: error ? "Failed to load conversations" : null,
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

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["messages", contextType, contextId],
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

    // Mark as read when conversation opens
    useEffect(() => {
        if (contextType && contextId) {
            messagesApi.markAsRead(contextType, contextId).catch(() => { });
        }
    }, [contextType, contextId]);

    const { mutateAsync: sendMessageMutation, isPending: sending } = useMutation({
        mutationFn: (content) =>
            messagesApi.sendMessage({
                content: content.trim(),
                contextType,
                contextId,
            }),
        onSuccess: (res) => {
            const newMessage = res.data.data.message;
            // Append new message to cache immediately
            queryClient.setQueryData(
                ["messages", contextType, contextId],
                (old) => (old ? [...old, newMessage] : [newMessage])
            );
            // Invalidate conversations and unread count so they refresh
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        }
    });

    const sendMessage = useCallback(
        async (content) => {
            if (!content.trim() || sending) return false;
            try {
                await sendMessageMutation(content);
                return true;
            } catch {
                return false;
            }
        },
        [sending, sendMessageMutation]
    );

    return {
        messages: data ?? [],
        loading: isLoading,
        sending,
        error: error ? "Failed to load messages" : null,
        sendMessage,
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
    const { } = useQuery({
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
 * Used in te nav badge
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