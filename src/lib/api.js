import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
    baseURL: API_URL,
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

// Handle unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401 && typeof window !== "undefined") {
            const url = error.config?.url || "";
            // Don't redirect for auth endpoints to valid loops
            const isAuthEndpoint =
                url.includes("/auth/login") || url.includes("/auth/me");

            if (!isAuthEndpoint) {
                window.location.href = "/login?reason=session_expired";
            }
        }
        return Promise.reject(error);
    }
)