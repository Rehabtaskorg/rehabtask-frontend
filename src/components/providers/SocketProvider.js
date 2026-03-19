"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, destroySocket } from "@/lib/socket";

const SocketContext = createContext({ connected: false, socket: null });

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
    const socketRef = useRef(null);

    // Track the current conversation the user is viewing (for join/leave)
    const currentRoomRef = useRef(null);

    const joinConversation = useCallback((contextType, contextId) => {
        const socket = socketRef.current;
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
        const socket = socketRef.current;
        if (!socket?.connected || !currentRoomRef.current) return;

        const { contextType, contextId } = currentRoomRef.current;
        socket.emit("leave:conversation", { contextType, contextId });
        currentRoomRef.current = null;
    }, []);

    useEffect(() => {
        if (!userId) {
            destroySocket();
            setConnected(false);
            return;
        }

        const socket = getSocket();
        socketRef.current = socket;

        // ─── Connection Events ───────────────────────────────────────────
        const onConnect = () => {
            setConnected(true);
            // Rejoin conversation room if user was viewing one during reconnect
            if (currentRoomRef.current) {
                const { contextType, contextId } = currentRoomRef.current;
                socket.emit("join:conversation", { contextType, contextId });
            }
        };

        const onDisconnect = () => {
            setConnected(false);
        };

        // ─── Message Events ─────────────────────────────────────────────
        const onNewMessage = () => {
            // Invalidate message queries — React Query re-fetches instantly
            queryClient.invalidateQueries({ queryKey: ["messages"] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        const onUnreadUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        const onMarkedRead = () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("message:new", onNewMessage);
        socket.on("message:unread_update", onUnreadUpdate);
        socket.on("messages:marked_read", onMarkedRead);

        // Connect
        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("message:new", onNewMessage);
            socket.off("message:unread_update", onUnreadUpdate);
            socket.off("messages:marked_read", onMarkedRead);
        };
    }, [userId, queryClient]);

    return (
        <SocketContext.Provider value={{ connected, socket: socketRef.current, joinConversation, leaveConversation }}>
            {children}
        </SocketContext.Provider>
    );
}