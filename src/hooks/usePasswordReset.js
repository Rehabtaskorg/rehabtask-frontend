import { useState } from "react";
import { authAPi } from "@/lib/auth.api";

export const usePasswordReset = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const requestPasswordReset = async (email) => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const response = await authAPi.requestPasswordReset(email);

            setSuccess(response.data.message);
            return { success: true, data: response.data };
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "Failed to send reset email. Please try again.";

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    }

    return {
        requestPasswordReset,
        isSubmitting,
        error,
        success,
        clearMessages
    };
};