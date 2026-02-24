"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useConversations, useMessages, useConversationContext } from "./useMessages";
import { useAuth } from "./useAuth";
import { getDisplayName, parseContextParam } from "@/utils/messages";

/**
 * Encapsulate all shared state logic for the messaging pages.
 * @param {string} - e.g '/customer/messages' or '/therapist/messages'
 */
export function useMessagesPage(basePath) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { conversations, loading: convLoading, error: convError, sessionExpired: convSessionExpired } = useConversations();
    const { user } = useAuth();

    const [selectedConversation, setSelectedConversation] = useState(null);
    const selected = selectedConversation
        ? {
            type: selectedConversation.currentContext?.type,
            id: selectedConversation.currentContext?.id,
            name: getDisplayName(selectedConversation.otherUser),
        }
        : null;

    const [mobileView, setMobileView] = useState('list');
    const [inputValue, setInputValue] = useState('');

    // Parse URL context param for fallback lookup
    const urlContextParam = parseContextParam(searchParams.get('c'));
    const { otherUser: urlOtherUser, patient: urlPatient, loading: urlContextLoading } = useConversationContext(
        urlContextParam?.type ?? null,
        urlContextParam?.id ?? null
    );

    const { messages, loading: msgLoading, error: msgError, sendMessage, retryMessage } = useMessages(
        selected?.type,
        selected?.id
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

        const match = conversations.find(
            (c) => c.currentContext?.type === contextParam.type && c.currentContext?.id === contextParam.id
        );

        if (match && (!selectedConversation || selectedConversation.currentContext?.id !== match.currentContext?.id)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedConversation(match);
            setMobileView('chat');
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

    // Reset input when switching conversations
    useEffect(() => {
        if (selected?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setInputValue('');
        }
    }, [selected?.id]);

    const handleSelectConversation = useCallback((conversation) => {
        setSelectedConversation(conversation);
        setMobileView('chat');
        updateUrlParam(conversation.currentContext?.type, conversation.currentContext?.id);
    }, [updateUrlParam]);

    const handleBackToList = useCallback(() => {
        setMobileView('list');
    }, []);

    const handleSendMessage = useCallback((content) => {
        sendMessage(content);
    }, [sendMessage]);

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
        msgError,

        // UI State
        mobileView,
        inputValue,
        setInputValue,

        // Actions
        handleSelectConversation,
        handleBackToList,
        handleSendMessage,
        retryMessage
    };
}