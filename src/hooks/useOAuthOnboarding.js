import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPi } from "@/lib/auth.api";

export const useOAuthOnboarding = () => {
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
            } else if (formData.role === "therapist") {
                payload.specialization = formData.specialization || undefined;
                payload.licenseNumber = formData.licenseNumber;
                payload.workArea = formData.workArea || undefined;
            }

            const response = await authAPi.completeOAuthOnboarding(payload);

            const { user } = response.data.data;

            // Redirect based on role
            if (user.role === "customer") {
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