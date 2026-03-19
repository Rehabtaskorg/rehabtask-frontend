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
 * - Connects when a user is authenticated (userId provided)
 * - Listens for message events and invalidates React Query caches
 * - Exposes connection status for smart polling (fast when disconnected, slow when connected)
 */
export function SocketProvider({ children, userId }) {
    const queryClient = useQueryClient();
    const [connected, setConnected] = useState(false);

    // Track the current conversation the user is viewing (for join/leave)
    const currentRoomRef = useRef(null);

    const joinConversation = useCallback((contextType, contextId) => {
        const socket = getSocket();
        if (!socket?.connected || !contextType || !contextId) return;

        // Leave previous room if different
        if (currentRoomRef.current) {
            const { contextType: prevType, contextId: prevId } = currentRoomRef.current;
            if (prevType !== contextType || prevId !== contextId) {
                socket.emit("leave:conversation", { contextType: prevType, contextId: prevId });
            }
        }

        socket.emit("join:conversation", { contextType, contextId });
        currentRoomRef.current = { contextType, contextId };
    }, []);

    const leaveConversation = useCallback(() => {
        const socket = getSocket();
        if (!socket?.connected || !currentRoomRef.current) return;

        const { contextType, contextId } = currentRoomRef.current;
        socket.emit("leave:conversation", { contextType, contextId });
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
                const { contextType, contextId } = currentRoomRef.current;
                socket.emit("join:conversation", { contextType, contextId });
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
            // Targeted: invalidate only the affected conversation's messages
            if (data?._contextType && data?._contextId) {
                queryClient.invalidateQueries({ queryKey: ["messages", data._contextType, data._contextId] });
            }
            // Also invalidate if viewing via direct thread (messages merge across contexts)
            if (data?.conversationId) {
                queryClient.invalidateQueries({ queryKey: ["messages", "direct", data.conversationId] });
            }
            // Always refresh conversation list (last message preview, unread count, ordering)
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
            if (data?.contextType && data?.contextId) {
                queryClient.invalidateQueries({ queryKey: ["messages", data.contextType, data.contextId] });
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