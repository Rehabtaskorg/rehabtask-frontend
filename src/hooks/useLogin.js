import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { authAPi } from "@/services/auth.api";
import { USER_ROLES } from "@/lib/constants";
import { resolveAuthRedirectTarget } from "@/lib/redirect";

/**
 *
 * @param {string | null} [redirectTo] - encoded `trigger:entityId` redirect descriptor from the auth-gate flow
 * @returns {{
 *   login: (formData: { email: string, password: string }) => Promise<{ success: boolean }>,
 *   isSubmitting: boolean,
 *   error: string | null,
 *   needsEmailVerification: boolean,
 *   twoFactorChallenge: object | null,
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
    const [twoFactorChallenge, setTwoFactorChallenge] = useState(null);
    const [loginCredentials, setLoginCredentials] = useState(null);

    const finishLogin = (response, { viaTwoFactor = false } = {}) => {
        const { user } = response.data.data;
        posthog?.capture("user_logged_in", { role: user.role });
        if (viaTwoFactor) {
            posthog?.capture("two_factor_login_completed", { role: user.role, method: twoFactorChallenge?.method });
        }
        const target = resolveAuthRedirectTarget(redirectTo, user.role);
        if (target) router.push(target);
        else if (user.role === USER_ROLES.CUSTOMER) router.push("/customer/dashboard");
        else if (user.role === USER_ROLES.THERAPIST) router.push("/therapist/dashboard");
        else if (user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.SUB_ADMIN) router.push("/admin/dashboard");
    };

    const login = async (formData) => {
        setError(null);
        setNeedsEmailVerification(false);
        setIsSubmitting(true);

        try {
            const response = await authAPi.login(formData.email, formData.password);
            if (response.data.requiresTwoFactor) {
                setLoginCredentials(formData);
                setTwoFactorChallenge(response.data.data.challenge);
                return { success: false, requiresTwoFactor: true };
            }

            finishLogin(response);

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

    const verifyTwoFactor = async (code) => {
        if (!twoFactorChallenge || !loginCredentials) return { success: false };
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await authAPi.verifyTwoFactorLogin({
                ...loginCredentials,
                challengeId: twoFactorChallenge.challengeId,
                challengeToken: twoFactorChallenge.challengeToken,
                code,
            });
            setTwoFactorChallenge(null);
            finishLogin(response, { viaTwoFactor: true });
            return { success: true };
        } catch (err) {
            const codeValue = err.response?.data?.code;
            setError(err.response?.data?.message || (codeValue === "2FA_CODE_EXPIRED" ? "This verification code has expired. Request a new code." : "The verification code is incorrect. Please try again."));
            return { success: false };
        } finally {
            setIsSubmitting(false);
        }
    };

    const resendTwoFactor = async () => {
        return switchTwoFactorMethod(twoFactorChallenge?.method);
    };

    const switchTwoFactorMethod = async (method) => {
        if (!loginCredentials) return { success: false };
        setError(null);
        setIsSubmitting(true);
        try {
            const response = await authAPi.resendTwoFactorLogin({ ...loginCredentials, method });
            setTwoFactorChallenge(response.data.data.challenge);
            return { success: true };
        } catch (err) {
            setError(err.response?.data?.message || "Unable to send a new verification code.");
            return { success: false };
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
        setTwoFactorChallenge(null);
        setLoginCredentials(null);
    };

    return { login, verifyTwoFactor, resendTwoFactor, switchTwoFactorMethod, twoFactorChallenge, isSubmitting, error, needsEmailVerification, resendVerification, clearError };
};
