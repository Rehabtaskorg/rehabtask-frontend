import axios from "axios";
import { LOGOUT_REASON } from "@/lib/constants";

export const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Track whether a token refresh is currently in progress
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
}

// Handle unauthorized responses - attempt refresh before redirecting
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || "";
        const status = error?.response?.status;
        const code = error?.response?.data?.code;

        console.log("[API Interceptor] ❌ Request failed:", {
            url,
            status,
            code,
            message: error?.response?.data?.message,
        });

        // Only handle errors in browser context
        if (typeof window === "undefined") {
            console.log("[API Interceptor] Server-side context — skipping client-side handling");
            return Promise.reject(error);
        }

        // If account was deactivated, clear the session and redirect immediately.
        // We must call /auth/logout first to clear all cookies — without this,
        // every subsequent page load re-mounts the dashboard, hits the same 401,
        // and the "Redirecting to login..." flash loops.
        if (code === "ACCOUNT_DEACTIVATED") {
            console.warn("[API Interceptor] 🚫 ACCOUNT_DEACTIVATED detected on:", url);
            console.log("[API Interceptor] Calling /auth/logout to clear session cookies before redirect...");
            try {
                await axios.post("/api/auth/logout");
                console.log("[API Interceptor] ✅ Logout call succeeded — cookies should be cleared");
            } catch (logoutError) {
                console.warn("[API Interceptor] ⚠️ Logout call failed (cookies may already be invalid):", logoutError?.message);
            }
            console.log("[API Interceptor] Redirecting to /login?reason=deactivated");
            window.location.href = `/login?reason=${LOGOUT_REASON.DEACTIVATED}`;
            return Promise.reject(error);
        }

        // Enrich rate limit errors so components can show a meaningful message
        if (status === 429) {
            const retryAfter = error.response.headers["retry-after"];
            error.isRateLimit = true;
            error.retryAfterSeconds = retryAfter ? parseInt(retryAfter) : 60;
            console.log("[API Interceptor] 🕐 Rate limited. Retry after:", error.retryAfterSeconds, "seconds");
            return Promise.reject(error);
        }

        if (status !== 401) {
            console.log("[API Interceptor] Non-401 error — passing through:", status);
            return Promise.reject(error);
        }

        console.log("[API Interceptor] 401 received for:", url, "| code:", code);

        // Don't attempt to refresh for login/refresh/logout endpoints (prevents loops)
        const isAuthEndpoint =
            url.includes("/auth/login") ||
            url.includes("/auth/token/refresh") ||
            url.includes("/auth/logout");

        if (isAuthEndpoint) {
            console.log("[API Interceptor] Auth endpoint 401 — no refresh attempt for:", url);
            if (url.includes("/auth/token/refresh")) {
                console.warn("[API Interceptor] ⚠️ Token refresh endpoint itself returned 401 (code:", code, ") — clearing session");
                try {
                    await axios.post("/api/auth/logout");
                    console.log("[API Interceptor] ✅ Logout succeeded after refresh failure");
                } catch (_) {
                    console.warn("[API Interceptor] ⚠️ Logout failed after refresh failure — cookies may already be gone");
                } finally {
                    console.log("[API Interceptor] Redirecting to /login?reason=session_expired");
                    window.location.href = `/login?reason=${LOGOUT_REASON.SESSION_EXPIRED}`;
                }
            }
            return Promise.reject(error);
        }

        // Don't attempt token refresh on public auth pages — the user is not
        // logged in intentionally (registering, resetting password, etc).
        // Stale cookies from a previous session would otherwise trigger a
        // failed refresh and redirect them away from the page they're on.
        const publicAuthPaths = ["/register", "/login", "/forgot-password", "/reset-password", "/verify-email"];
        const currentPath = window.location.pathname;
        const isPublicAuthPage = publicAuthPaths.some((path) => currentPath.startsWith(path));

        if (isPublicAuthPage) {
            console.log("[API Interceptor] On public auth page (", currentPath, ") — skipping refresh to avoid redirect loop");
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            console.warn("[API Interceptor] ⚠️ Already retried this request — not retrying again:", url);
            return Promise.reject(error);
        }

        // If already refreshing, queue this request to retry once the refresh completes
        if (isRefreshing) {
            console.log("[API Interceptor] Refresh already in progress — queuing request:", url);
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                console.log("[API Interceptor] Retrying queued request after refresh:", url);
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;
        console.log("[API Interceptor] 🔄 Attempting token refresh for failed request:", url);

        try {
            await api.post("/auth/token/refresh");
            console.log("[API Interceptor] ✅ Token refresh succeeded — retrying original request:", url);
            processQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            const refreshCode = refreshError?.response?.data?.code;
            console.error("[API Interceptor] ❌ Token refresh failed:", {
                status: refreshError?.response?.status,
                code: refreshCode,
                message: refreshError?.response?.data?.message,
            });
            processQueue(refreshError);
            try {
                await axios.post("/api/auth/logout");
                console.log("[API Interceptor] ✅ Logout succeeded after refresh failure");
            } catch (_) {
                console.warn("[API Interceptor] ⚠️ Logout failed after refresh failure — cookies may already be gone");
            } finally {
                console.log("[API Interceptor] Redirecting to /login?reason=session_expired");
                window.location.href = `/login?reason=${LOGOUT_REASON.SESSION_EXPIRED}`;
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);