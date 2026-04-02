"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, destroySocket } from "@/lib/socket";

const SocketContext = createContext({ connected: false });

export function useSocketContext() {
    return useContext(SocketContext);
}

/**
 * SocketProvider manages the Socket.io client lifecycle.
 * Phase 3: rooms use conversation:{conversationId} format.
 */
export function SocketProvider({ children, userId }) {
    const queryClient = useQueryClient();
    const [connected, setConnected] = useState(false);

    // Track the current conversation the user is viewing
    const currentRoomRef = useRef(null);

    const joinConversation = useCallback((conversationId) => {
        const socket = getSocket();
        if (!socket?.connected || !conversationId) return;

        // Leave previous room if different
        if (currentRoomRef.current && currentRoomRef.current !== conversationId) {
            socket.emit("leave:conversation", { conversationId: currentRoomRef.current });
        }

        socket.emit("join:conversation", { conversationId });
        currentRoomRef.current = conversationId;
    }, []);

    const leaveConversation = useCallback(() => {
        const socket = getSocket();
        if (!socket?.connected || !currentRoomRef.current) return;

        socket.emit("leave:conversation", { conversationId: currentRoomRef.current });
        currentRoomRef.current = null;
    }, []);

    useEffect(() => {
        if (!userId) {
            destroySocket();
            return;
        }

        const socket = getSocket();

        // ─── Connection Events ───────────────────────────────────────────
        const onConnect = () => {
            console.log("[Socket] Connected:", socket.id);
            setConnected(true);
            if (currentRoomRef.current) {
                socket.emit("join:conversation", { conversationId: currentRoomRef.current });
            }
        };

        const onDisconnect = (reason) => {
            console.log("[Socket] Disconnected:", reason);
            setConnected(false);
        };

        const onConnectError = (err) => {
            console.error("[Socket] Connection error:", err.message);
        };

        // ─── Message Events ─────────────────────────────────────────────
        const onNewMessage = (data) => {
            console.log("[Socket] message:new received", data?.id);
            // Invalidate the conversation's messages cache
            if (data?.conversationId) {
                queryClient.invalidateQueries({ queryKey: ["messages", data.conversationId] });
            }
            // Always refresh conversation list and unread count
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
        };

        const onUnreadUpdate = (data) => {
            console.log("[Socket] unread_update received", data);
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        const onMarkedRead = (data) => {
            console.log("[Socket] marked_read received", data);
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
            // Refresh message thread to show read receipts
            if (data?.conversationId) {
                queryClient.invalidateQueries({ queryKey: ["messages", data.conversationId] });
            }
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("connect_error", onConnectError);
        socket.on("message:new", onNewMessage);
        socket.on("message:unread_update", onUnreadUpdate);
        socket.on("messages:marked_read", onMarkedRead);

        // Connect
        console.log("[Socket] Attempting connection for user:", userId);
        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("connect_error", onConnectError);
            socket.off("message:new", onNewMessage);
            socket.off("message:unread_update", onUnreadUpdate);
            socket.off("messages:marked_read", onMarkedRead);
        };
    }, [userId, queryClient]);

    return (
        <SocketContext.Provider value={{ connected, joinConversation, leaveConversation }}>
            {children}
        </SocketContext.Provider>
    );
}
