import { useCallback } from "react";
import { showToast } from "@/lib/toast";

export function useRateLimitHandler() {
    const handleError = useCallback((error) => {
        if (error?.isRateLimit) {
            const seconds = error.retryAfterSeconds ?? 60;
            showToast.warning(
                `Too many requests. Please wait ${seconds} second${seconds === 1 ? "" : "s"} before trying again.`,
                { autoClose: Math.max(seconds * 1000, 5000) }
            );
            return true;
        }
        return false;
    }, []);

    return handleError;
}
