import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPi } from "@/lib/auth.api";

export const useTherapistRegistration = () => {
    const router = useRouter();
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
            }

            const response = await authAPi.registerTherapist(payload);

            setSuccess(response.data.message);

            // redirect to email verification page with email as param
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
            }
            else {
                errorMessage = "Registration failed. Please try again.";
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsSubmitting(false);
        }

    }

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    }

    return {
        registerTherapist,
        isSubmitting,
        error,
        success,
        clearMessages
    };
};