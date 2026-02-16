import { useState } from "react";
import { authAPi } from "@/lib/auth.api";

export const useChangePassword = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const response = await authAPi.changePassword(currentPassword, newPassword, confirmNewPassword);

            setSuccess(response.data.message || "Password changed successfully");

            return { success: true, data: response.data };
        } catch (err) {
            const apiError = err.response?.data;

            let errorMessage;

            if (apiError?.errors?.length) {
                errorMessage = apiError.errors.map(e => e.message).join(", ");
            } else if (apiError?.message) {
                errorMessage = apiError.message;
            } else if (err?.message) {
                errorMessage = err.message;
            } else {
                errorMessage = "Failed to change password. Please try again.";
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        }

    }

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    }

    return { changePassword, isSubmitting, error, success, clearMessages };
}