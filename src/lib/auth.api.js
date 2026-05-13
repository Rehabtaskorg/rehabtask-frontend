import { api } from "./api";

/**
 * Get reCAPTCHA token for a specific action
 * @param {string} action - The action name (UPPERCASE, e.g. "LOGIN", "REGISTER_CUSTOMER")
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
        // Wait for RECAPTCHA to be fully initialized before executing
        await new Promise((resolve) => window.grecaptcha.ready(resolve));
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
        const recaptchaAction = "REGISTER_CUSTOMER";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/register/customer", {
            ...data,
            recaptchaToken,
            recaptchaAction,
        });
    },

    /**
     * Register a new therapist
     */
    registerTherapist: async (data) => {
        const recaptchaAction = "REGISTER_THERAPIST";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/register/therapist", {
            ...data,
            recaptchaToken,
            recaptchaAction,
        });
    },

    /**
     * Login with email and password
     */
    login: async (email, password) => {
        const recaptchaAction = "LOGIN";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/login", {
            email,
            password,
            recaptchaToken,
            recaptchaAction,
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
        const recaptchaAction = "FORGOT_PASSWORD";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/password/forgot", {
            email,
            recaptchaToken,
            recaptchaAction,
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
        const recaptchaAction = "RESEND_VERIFICATION";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/email/resend", {
            email,
            recaptchaToken,
            recaptchaAction,
        });
    },

    /**
    * Verify email in database
    */
    verifyEmail: async (userId, fullName) => {
        return api.post("/auth/verify-email", { userId, ...(fullName ? { fullName } : {}) });
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