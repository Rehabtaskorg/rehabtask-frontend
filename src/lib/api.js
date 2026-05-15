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

        // Only handle 401 errors in browser context
        if (typeof window === "undefined") {
            return Promise.reject(error);
        }

        // If account was deactivated, redirect immediately
        if (error?.response?.data?.code === "ACCOUNT_DEACTIVATED") {
            window.location.href = `/login?reason=${LOGOUT_REASON.DEACTIVATED}`;
            return Promise.reject(error);
        }

        // Enrich rate limit errors so components can show a meaningful message
        if (error?.response?.status === 429) {
            const retryAfter = error.response.headers["retry-after"];
            error.isRateLimit = true;
            error.retryAfterSeconds = retryAfter ? parseInt(retryAfter) : 60;
            return Promise.reject(error);
        }

        if (error?.response?.status !== 401) {
            return Promise.reject(error);
        }

        const url = originalRequest?.url || "";

        // Don't attempt to refresh for login/refresh/logout endpoints (prevents loops)
        const isAuthEndpoint =
            url.includes("/auth/login") ||
            url.includes("/auth/token/refresh") ||
            url.includes("/auth/logout");

        if (isAuthEndpoint) {
            if (url.includes("/auth/token/refresh")) {
                try {
                    await axios.post("/api/auth/logout");
                } catch (_) {
                    // best-effort — cookies may already be invalid
                } finally {
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
        if (publicAuthPaths.some((path) => window.location.pathname.startsWith(path))) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => api(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Attempt to refresh the token (cookies sent automatically)
            await api.post("/auth/token/refresh");

            processQueue(null);

            // Return the original request with the new token
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError);

            try {
                await axios.post("/api/auth/logout");
            } catch (_) {
                // best-effort — cookies may already be invalid
            } finally {
                window.location.href = `/login?reason=${LOGOUT_REASON.SESSION_EXPIRED}`;
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);