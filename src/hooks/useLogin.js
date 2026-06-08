import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { authAPi } from "@/lib/auth.api";
import { USER_ROLES } from "@/lib/constants";

/**
 *
 * @param {string | null} [redirectTo]
 * @returns {{
 *   login: (formData: { email: string, password: string }) => Promise<{ success: boolean }>,
 *   isSubmitting: boolean,
 *   error: string | null,
 *   needsEmailVerification: boolean,
 *   resendVerification: () => Promise<void>,
 *   clearError: () => void,
 * }}
 */
export const useLogin = (redirectTo = null) => {
    const router = useRouter();
    const posthog = usePostHog();
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

            // Fire before redirect so the event is captured in this session.
            posthog?.capture("user_logged_in", { role: user.role });

            if (redirectTo) {
                router.push(redirectTo);
            } else if (user.role === USER_ROLES.CUSTOMER) {
                router.push("/customer/dashboard");
            } else if (user.role === USER_ROLES.THERAPIST) {
                router.push("/therapist/dashboard");
            } else if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUB_ADMIN) {
                router.push("/admin/dashboard");
            }

            return { success: true, data: response.data };

        } catch (err) {
            const errorCode = err.response?.data?.code;
            const errorMessage = err.response?.data?.message;

            if (errorCode === "ACCOUNT_DEACTIVATED") {
                setError("Your account has been deactivated. Please contact support.");
            } else if (errorCode === "EMAIL_NOT_VERIFIED") {
                setNeedsEmailVerification(true);
                setUserEmail(formData.email);
                setError(errorMessage || "Please verify your email before logging in.");
            } else if (err.response?.status === 401 || errorCode === "INVALID_CREDENTIALS") {
                setError("Invalid email or password");
            } else if (errorCode === "RECAPTCHA FAILED" || errorCode === "RECAPTCHA_REQUIRED") {
                setError("Security verification failed. Please try again.");
            } else {
                setError(errorMessage || "Login failed. Please try again.");
            }

            return { success: false, error: err };
        } finally {
            setIsSubmitting(false);
        }
    };

    const resendVerification = async () => {
        if (!userEmail) return;

        try {
            await authAPi.resendVerificationEmail(userEmail);
            setError("Verification email sent! Please check your inbox.");
        } catch {
            setError("Failed to resend verification email. Please try again.");
        }
    };

    const clearError = () => {
        setError(null);
        setNeedsEmailVerification(false);
    };

    return { login, isSubmitting, error, needsEmailVerification, resendVerification, clearError };
};
