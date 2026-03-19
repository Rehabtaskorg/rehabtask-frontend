import { io } from "socket.io-client";
import { api } from "./api";

let socket = null;

/**
 * Get or create the Socket.io client singleton.
 * Uses a one-time ticket for authentication (safe for cross-origin).
 * The ticket is fetched from the backend via an authenticated REST call
 * (cookies are sent automatically), so the actual access token is never
 * exposed to JavaScript.
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
            auth: async (cb) => {
                try {
                    // Fetch a one-time ticket from the backend
                    // This REST call sends httpOnly cookies automatically
                    const res = await api.get("/auth/socket-ticket");
                    cb({ ticket: res.data.data.ticket });
                } catch {
                    cb({ ticket: "" });
                }
            },
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
