import axios from "axios";

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
            window.location.href = "/login?reason=deactivated";
            return Promise.reject(error);
        }

        if (error?.response?.status !== 401) {
            return Promise.reject(error);
        }

        const url = originalRequest?.url || "";

        // Don't attempt to refresh for auth endpoints (prevents loops)
        const isAuthEndpoint =
            url.includes("/auth/login") ||
            url.includes("/auth/me") ||
            url.includes("/auth/token/refresh");

        if (isAuthEndpoint || originalRequest._retry) {
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

            // Refresh failed — redirect to login
            window.location.href = "/login?reason=session_expired";
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);