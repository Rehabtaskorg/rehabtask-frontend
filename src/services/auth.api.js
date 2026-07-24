import { api } from "./api";

/**
 * Get a reCAPTCHA Enterprise token for a specific action.
 * Returns null silently if reCAPTCHA is not loaded (e.g. script blocked in
 * Incognito) — the backend treats a missing token as a soft failure rather
 * than a hard block in most environments.
 *
 * @param {string} action - UPPERCASE action name, e.g. "LOGIN"
 * @returns {Promise<string|null>}
 */
const getRecaptchaToken = async (action) => {
    if (typeof window === "undefined" || !window.grecaptcha?.enterprise) return null;

    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return null;

    try {
        await new Promise((resolve) => window.grecaptcha.enterprise.ready(resolve));
        return await window.grecaptcha.enterprise.execute(siteKey, { action });
    } catch {
        return null;
    }
};

/**
 * Centralized auth API calls.
 * All methods that interact with reCAPTCHA-protected endpoints attach a token
 * automatically — callers do not need to handle reCAPTCHA themselves.
 */
export const authAPi = {
    /** Register a new customer. */
    registerCustomer: async (data) => {
        const recaptchaAction = "REGISTER_CUSTOMER";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/register/customer", { ...data, recaptchaToken, recaptchaAction });
    },

    /** Register a new therapist. */
    registerTherapist: async (data) => {
        const recaptchaAction = "REGISTER_THERAPIST";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/register/therapist", { ...data, recaptchaToken, recaptchaAction });
    },

    /** Login with email and password. */
    login: async (email, password) => {
        const recaptchaAction = "LOGIN";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/login", { email, password, recaptchaToken, recaptchaAction });
    },

    /** Logout the current user. */
    logout: async () => api.post("/auth/logout"),

    /** Get the current authenticated user. */
    getCurrentUser: async () => api.get("/auth/me"),

    /** Request a password reset email. */
    requestPasswordReset: async (email) => {
        const recaptchaAction = "FORGOT_PASSWORD";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/password/forgot", { email, recaptchaToken, recaptchaAction });
    },

    /** Change password for the authenticated user. */
    changePassword: async (currentPassword, newPassword, confirmNewPassword) =>
        api.post("/auth/password/change", { currentPassword, newPassword, confirmNewPassword }),

    /** Resend the email verification link. */
    resendVerificationEmail: async (email, redirect = null) => {
        const recaptchaAction = "RESEND_VERIFICATION";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/email/resend", {
            email,
            recaptchaToken,
            recaptchaAction,
            ...(redirect ? { redirect } : {}),
        });
    },

    /** Mark email as verified in the database. Identify by userId or email. */
    verifyEmail: async (userId, fullName, email) =>
        api.post("/auth/verify-email", {
            ...(userId ? { userId } : {}),
            ...(email ? { email } : {}),
            ...(fullName ? { fullName } : {}),
        }),

    /** Send Supabase OAuth tokens to the backend for session creation. */
    processOAuth: async (accessToken, refreshToken) =>
        api.post("/auth/oauth/process", { accessToken, refreshToken }),

    /** Complete OAuth onboarding with profile data. */
    completeOAuthOnboarding: async (profileData) =>
        api.post("/auth/oauth/onboarding", profileData),

    /** Refresh the access token using a refresh token. */
    refreshToken: async (refreshToken) =>
        api.post("/auth/token/refresh", { refreshToken }),

    /** Get role-filtered sections of the unified legal agreement. */
    getAgreementContent: async () => api.get("/auth/agreement/content"),

    /** Record that the authenticated user has accepted the unified agreement. */
    acceptAgreement: async () => api.post("/auth/agreement/accept"),
};
