import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPi } from "@/lib/auth.api";

export const useLogin = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    const login = async (formData) => {
        setError(null);
        setNeedsEmailVerification(false);
        setIsSubmitting(true);

        try {
            const response = await authAPi.login(formData.email, formData.password);

            const { user } = response.data.data;

            if (user.role === "customer") {
                router.push("/customer/dashboard");
            } else if (user.role === "therapist") {
                router.push("/therapist/dashboard");
            } else if (user.role === "admin") {
                router.push("/admin/dashboard");
            }

            return { success: true, data: response.data };

        } catch (err) {
            const errorCode = err.response?.data?.code;
            const errorMessage = err.response?.data?.message;

            if (errorCode === "EMAIL_NOT_VERIFIED") {
                setNeedsEmailVerification(true);
                setUserEmail(formData.email);
                setError(errorMessage || "Please verify your email before logging in.")
            }
            else if (err.response?.status === 401 || errorCode === "INVALID_CREDENTIALS") {
                setError("Invalid email or password");
            } else if (errorCode === "RECAPTCHA FAILED" || errorCode === "RECAPTCHA_REQUIRED") {
                setError("Security verification failed. Please try again.");
            }
            else {
                setError(errorMessage || "Login failed. Please try again.")
            }

            return { success: false, error: err };
        } finally {
            setIsSubmitting(false);
        }
    };

    const resendVerification = async () => {
        if (!userEmail) return;

        try {
            await authAPi.resendVerificationEmail(userEmail)
            setError("Verification email sent! Please check your inbox.");
        } catch (error) {
            setError("Failed to resend verification email. Please try again.");
        }
    };

    const clearError = () => {
        setError(null);
        setNeedsEmailVerification(false);
    };

    return { login, isSubmitting, error, needsEmailVerification, resendVerification, clearError };
};