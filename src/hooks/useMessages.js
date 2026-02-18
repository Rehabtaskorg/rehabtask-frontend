"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { messagesApi } from "@/lib/messages.api";

/**
 * Hook to manage conversation list with polling
 * Use in the message sidebar
 */
export function useConversations(pollInterval = 10000) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    const fetchConversations = useCallback(async () => {
        try {
            const res = await messagesApi.getConversations();
            setConversations(res.data.data.conversations);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            setError('Failed to load conversations');
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();

        // Poll every N ms for new conversations / unread updates
        intervalRef.current = setInterval(fetchConversations, pollInterval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchConversations, pollInterval])

    return { conversations, loading, error, refetch: fetchConversations };
}

/**
 * Hook to manage messages in an active conversation thread
 * @param {string} contextType - "request" | "booking"
 * @param {string} contextId - UUID
 */
export function useMessages(contextType, contextId, pollInterval = 5000) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);
    const lastMessageIdRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        if (!contextType || !contextId) return;

        try {
            const res = await messagesApi.getMessages(contextType, contextId, {
                limit: 50,
                order: "asc"
            });

            const fetched = res.data.data.messages;

            // Only update state if there are new messages (avoid unnecessary re-renders)
            const latestId = fetched[fetched.length - 1]?.id;
            if (latestId !== lastMessageIdRef.current) {
                setMessages(fetched);
                lastMessageIdRef.current = latestId;
            }

            setError(null);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [contextType, contextId]);

    // mark as read when conversation opens
    const markAsRead = useCallback(async () => {
        if (!contextType || !contextId) return;
        try {
            await messagesApi.markAsRead(contextType, contextId);
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    }, [contextType, contextId]);

    useEffect(() => {
        setLoading(true);
        setMessages([]);
        lastMessageIdRef.current = null;

        fetchMessages();
        markAsRead();

        // poll for new messages
        intervalRef.current = setInterval(() => {
            fetchMessages();
        }, pollInterval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [fetchMessages, markAsRead, pollInterval]);

    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || sending) return false;
        setSending(true);

        try {
            const res = await messagesApi.sendMessage({
                content: content.trim(),
                contextType,
                contextId
            });

            setMessages((prev) => [...prev, res.data.data.message]);
            lastMessageIdRef.current = res.data.data.message.id;
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            setError('Failed to send message');
            return false;
        } finally {
            setSending(false);
        }

    }, [contextType, contextId, sending]);

    return { messages, loading, sending, error, sendMessage, refetch: fetchMessages };

}

/**
 * Hook to get and poll unread message count
 * Used in te nav badge
 */
export function useUnreadCount(pollInterval = 15000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchCount = async () => {
            try {
                const res = await messagesApi.getUnreadCount();
                if (isMounted) setCount(res.data.data.count);
            } catch (error) {
                // Silently ignore — badge is non-critical
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, pollInterval);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [pollInterval]);

    return count;
}