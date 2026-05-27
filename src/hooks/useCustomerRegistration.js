import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { authAPi } from "@/lib/auth.api";
import { USER_ROLES, CUSTOMER_TYPES } from "@/lib/constants";

/**
 * Handles customer registration form submission and signup analytics.
 *
 * @returns {{
 *   registerCustomer: (formData: object) => Promise<{ success: boolean }>,
 *   isSubmitting: boolean,
 *   error: string | null,
 *   success: string | null,
 *   clearMessages: () => void,
 * }}
 */
export const useCustomerRegistration = () => {
    const router = useRouter();
    const posthog = usePostHog();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const registerCustomer = async (formData) => {
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone,
                customerType: formData.customerType,
                agencyName: formData.customerType === CUSTOMER_TYPES.AGENCY
                    ? formData.agencyName
                    : undefined,
            };

            const response = await authAPi.registerCustomer(payload);
            setSuccess(response.data.message);

            posthog?.capture("user_signed_up", {
                role: USER_ROLES.CUSTOMER,
                customer_type: formData.customerType,
            });

            setTimeout(() => {
                router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
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
        registerCustomer,
        isSubmitting,
        error,
        success,
        clearMessages,
    };
};