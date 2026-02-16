import { api } from "./api";

/**
 * Get reCAPTCHA token for a specific action
 * @param {string} action - The action name (e.g "login", "register", "forgot_password")
 * @return {Promise<string>} reCAPTCHA token
 */
const getRecaptchaToken = async (action) => {
    if (typeof window === "undefined" || !window.grecaptcha) {
        console.warn("reCAPTCHA not loaded");
        return null;
    }

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
        console.warn("⚠️  reCAPTCHA site key not configured");
        return null;
    }

    try {
        const token = await window.grecaptcha.execute(siteKey, { action });
        return token;
    } catch (error) {
        console.error("reCAPTCHA token generation failed:", error);
        return null;
    }

}

/**
 * Centralized auth API calls
 * All Authentication-related API endpoints
 */
export const authAPi = {
    /**
     * Register a new customer
     */
    registerCustomer: async (data) => {
        const recaptchaToken = await getRecaptchaToken("register_customer");
        return api.post("/auth/register/customer", {
            ...data,
            recaptchaToken,
        });
    },

    /**
     * Register a new therapist
     */
    registerTherapist: async (data) => {
        const recaptchaToken = await getRecaptchaToken("register_therapist");
        return api.post("/auth/register/therapist", {
            ...data,
            recaptchaToken,
        });
    },

    /**
     * Login with email and password
     */
    login: async (email, password) => {
        const recaptchaToken = await getRecaptchaToken("login");
        return api.post("/auth/login", {
            email,
            password,
            recaptchaToken,
        });
    },

    /**
    * Logout current user
    */
    logout: async () => {
        return api.post("/auth/logout");
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser: async () => {
        return api.get("/auth/me");
    },

    /**
     * Request password reset mail
     */
    requestPasswordReset: async (email) => {
        const recaptchaToken = await getRecaptchaToken("forgot_password");
        return api.post("/auth/password/forgot", {
            email,
            recaptchaToken,
        });
    },

    /**
     * Change password for authenticated user
     */
    changePassword: async (currentPassword, newPassword, confirmNewPassword) => {
        const payload = {
            currentPassword,
            newPassword,
            confirmNewPassword
        }

        return api.post("/auth/password/change", payload);
    },

    /**
     * Resend email verification
     */
    resendVerificationEmail: async (email) => {
        const recaptchaToken = await getRecaptchaToken("resend_verification");
        return api.post("/auth/email/resend", {
            email,
            recaptchaToken,
        });
    },

    /**
    * Verify email in database
    */
    verifyEmail: async (userId) => {
        return api.post("/auth/verify-email", { userId });
    },

    /**
     * Process OAuth tokens (send to backend after getting from Supabase)
     */
    processOAuth: async (accessToken, refreshToken) => {
        return api.post("/auth/oauth/process", {
            accessToken,
            refreshToken
        });
    },

    /**
     * Complete OAuth onboarding
     */
    completeOAuthOnboarding: async (profileData) => {
        return api.post("/auth/oauth/onboarding", profileData);
    },

    /**
         * Refresh access token
         */
    refreshToken: async (refreshToken) => {
        return api.post("/auth/token/refresh", {
            refreshToken,
        });
    },
}