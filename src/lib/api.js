import axios from "axios";
import { LOGOUT_REASON } from "@/lib/constants";

/**
 * Axios instance for all authenticated API calls.
 * Sends cookies automatically (withCredentials) so the backend
 * can read httpOnly session cookies on every request.
 */
export const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json", 
    },
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

// Track whether a token refresh is currently in progress
let isRefreshing = false;
let failedQueue = [];

/**
 * Flush all queued requests that were held while a token refresh was in flight.
 * Resolves them on success or rejects them on failure.
 *
 * @param {Error|null} error - null on success, the refresh error on failure
 */
const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

/**
 * Response interceptor — handles 401s across the whole app.
 *
 * Decision tree on a 401:
 * 1. ACCOUNT_DEACTIVATED  → call /auth/logout to clear all cookies, then hard-redirect
 *                           to login. The logout call is critical — without it every
 *                           subsequent page load re-mounts the dashboard, hits the same
 *                           401, and produces a visible redirect loop.
 * 2. Auth endpoint 401    → no refresh attempt (would loop). If /token/refresh itself
 *                           returned 401, clear session and redirect.
 * 3. Public auth page     → no refresh attempt (user is intentionally unauthenticated).
 * 4. Already retried      → give up, reject.
 * 5. Refresh in progress  → queue the request; retry once refresh completes.
 * 6. Default              → attempt /token/refresh, retry original request on success,
 *                           clear session and redirect on failure.
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest?.url || "";
        const status = error?.response?.status;
        const code = error?.response?.data?.code;

        // Only handle errors in browser context
        if (typeof window === "undefined") {
            return Promise.reject(error);
        }

        // 1. Account deactivated — clear session cookies first to prevent the
        //    redirect loop, then hard-navigate to login.
        if (code === "ACCOUNT_DEACTIVATED") {
            try {
                await axios.post("/api/auth/logout");
            } catch (_) {
                // best-effort — cookies may already be invalid
            }
            window.location.href = `/login?reason=${LOGOUT_REASON.DEACTIVATED}`;
            return Promise.reject(error);
        }

        // Enrich rate limit errors so components can show a meaningful message
        if (status === 429) {
            const retryAfter = error.response.headers["retry-after"];
            error.isRateLimit = true;
            error.retryAfterSeconds = retryAfter ? parseInt(retryAfter) : 60;
            return Promise.reject(error);
        }

        if (status !== 401) {
            return Promise.reject(error);
        }

        // 2. Don't attempt to refresh for auth endpoints (prevents loops)
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

        // 3. Don't attempt token refresh on public auth pages — the user is not
        //    logged in intentionally (registering, resetting password, etc).
        //    Stale cookies from a previous session would otherwise trigger a
        //    failed refresh and redirect them away from the page they're on.
        const publicAuthPaths = ["/register", "/login", "/forgot-password", "/reset-password", "/verify-email"];
        if (publicAuthPaths.some((path) => window.location.pathname.startsWith(path))) {
            return Promise.reject(error);
        }

        // 4. Already retried this request — don't retry again
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // 5. Refresh already in progress — queue this request to retry after
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => api(originalRequest));
        }

        // 6. Attempt token refresh, then retry the original request
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await api.post("/auth/token/refresh");
            processQueue(null);
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