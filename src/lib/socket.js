import { io } from "socket.io-client";

let socket = null;

/**
 * Get or create the Socket.io client singleton.
 * Connects to the backend API URL with credentials (cookies).
 * autoConnect is false — the SocketProvider manages connection lifecycle.
 */
export function getSocket() {
    if (!socket) {
        const url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace("/api", "");
        if (!url) {
            console.warn("[Socket] No socket URL configured — real-time disabled");
            return null;
        }
        socket = io(url, {
            withCredentials: true,
            autoConnect: false,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: Infinity,
        });
    }
    return socket;
}

/**
 * Disconnect and destroy the socket instance.
 * Called on logout.
 */
export function destroySocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}