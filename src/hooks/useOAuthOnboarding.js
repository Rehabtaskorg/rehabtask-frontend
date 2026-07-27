import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPi } from "@/services/auth.api";
import { resolveAuthRedirectTarget } from "@/lib/redirect";

/**
 * @param {string | null} [redirectTo] - encoded `trigger:entityId` redirect descriptor from the auth-gate flow
 */
export const useOAuthOnboarding = (redirectTo = null) => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const completeOnboarding = async (formData) => {
        setError(null);
        setIsSubmitting(true);

        try {
            // Build payload based on role
            const payload = {
                role: formData.role,
                fullName: formData.fullName,
                phone: formData.phone
            };

            // Add role-specific fields
            if (formData.role === "customer") {
                payload.customerType = formData.customerType;
                payload.agencyName = formData.customerType === "agency"
                    ? formData.agencyName
                    : undefined;
                payload.location = formData.location || undefined;
            }

            const response = await authAPi.completeOAuthOnboarding(payload);

            const { user } = response.data.data;

            const target = resolveAuthRedirectTarget(redirectTo, user.role);

            if (target) {
                router.push(target);
            } else if (user.role === "customer") {
                router.push("/customer/dashboard");
            } else if (user.role === "therapist") {
                router.push("/therapist/dashboard");
            }

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
                errorMessage = "Failed to complete profile. Please try again.";
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsSubmitting(false);
        }
    }

    const clearError = () => {
        setError(null);
    }

    return {
        completeOnboarding,
        isSubmitting,
        error,
        clearError
    }
}