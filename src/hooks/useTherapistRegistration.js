import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPi } from "@/services/auth.api";
import { useAnalytics } from "@/hooks/useAnalytics";
import { USER_ROLES } from "@/lib/constants";
import { stashAuthRedirect } from "@/lib/redirect";

/**
 * Handles therapist registration form submission and signup analytics.
 *
 * @param {string | null} [redirectTo] - encoded `trigger:entityId` descriptor to resume after verification
 * @returns {{
 *   registerTherapist: (formData: object) => Promise<{ success: boolean }>,
 *   isSubmitting: boolean,
 *   error: string | null,
 *   success: string | null,
 *   clearMessages: () => void,
 * }}
 */
export const useTherapistRegistration = (redirectTo = null) => {
    const router = useRouter();
    const { trackEvent } = useAnalytics();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const registerTherapist = async (formData) => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone,
                smsOptIn: formData.smsOptIn ?? false,
            };

            const response = await authAPi.registerTherapist(payload);
            setSuccess(response.data.message);

            const hasRedirect = Boolean(redirectTo);
            trackEvent("user_signed_up", {
                role: USER_ROLES.THERAPIST,
                signup_source: hasRedirect ? "public_referral" : "direct",
            });

            if (hasRedirect) {
                trackEvent("therapist_signup_from_public_referral", { hasRedirect: true });
            }

            stashAuthRedirect(redirectTo);

            setTimeout(() => {
                const verifyUrl = new URL("/verify-email", window.location.origin);
                verifyUrl.searchParams.set("email", formData.email);
                if (redirectTo) verifyUrl.searchParams.set("redirect", redirectTo);
                router.push(verifyUrl.pathname + verifyUrl.search);
            }, 1500);

            return { success: true, data: response.data };
        } catch (err) {
            const apiError = err.response?.data;

            let errorMessage;
            if (apiError?.errors?.length) {
                errorMessage = apiError.errors.map(e => e.message).join(", ");
            } else if (err?.message) {
                errorMessage = err.message;
            } else if (apiError?.message) {
                errorMessage = apiError.message;
            } else {
                errorMessage = "Registration failed. Please try again.";
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    return {
        registerTherapist,
        isSubmitting,
        error,
        success,
        clearMessages,
    };
};