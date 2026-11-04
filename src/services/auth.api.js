import { api } from "@/lib/api";
import { getRecaptchaToken } from "@/lib/recaptcha";

export const authAPi = {
    startSignupPhoneVerification: async (email, phone) => {
        const recaptchaAction = "REGISTER_PHONE";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/register/phone/start", { email, phone, recaptchaToken, recaptchaAction });
    },
    startOnboardingPhoneVerification: async (phone) => api.post("/auth/oauth/phone/start", { phone }),

    registerCustomer: async (data) => {
        const recaptchaAction = "REGISTER_CUSTOMER";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/register/customer", { ...data, recaptchaToken, recaptchaAction });
    },

    registerTherapist: async (data) => {
        const recaptchaAction = "REGISTER_THERAPIST";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/register/therapist", { ...data, recaptchaToken, recaptchaAction });
    },

    login: async (email, password) => {
        const recaptchaAction = "LOGIN";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/login", { email, password, recaptchaToken, recaptchaAction });
    },

    verifyTwoFactorLogin: async ({ email, password, challengeId, challengeToken, code }) =>
        api.post("/auth/2fa/login/verify", { email, password, challengeId, challengeToken, code }),

    resendTwoFactorLogin: async ({ email, password, method }) =>
        api.post("/auth/2fa/login/resend", { email, password, ...(method ? { method } : {}) }),

    getTwoFactorStatus: async () => api.get("/auth/2fa/status"),
    startTwoFactorEnrollment: async (method, phoneNumber) => api.post("/auth/2fa/enrollment/start", { method, ...(phoneNumber ? { phoneNumber } : {}) }),
    verifyTwoFactorEnrollment: async (payload) => api.post("/auth/2fa/enrollment/verify", payload),
    startDisableTwoFactor: async (method) => api.post("/auth/2fa/disable/start", method ? { method } : {}),
    disableTwoFactor: async (payload) => api.post("/auth/2fa/disable", payload),
    removeSmsMethod: async (currentPassword) => api.post("/auth/2fa/methods/sms/remove", { currentPassword }),
    setTwoFactorEnabled: async (enabled) => api.patch("/auth/2fa/toggle", { enabled }),
    setPreferredTwoFactorMethod: async (method) => api.patch("/auth/2fa/preferred-method", { method }),

    logout: async () => api.post("/auth/logout"),

    getCurrentUser: async () => api.get("/auth/me"),

    requestPasswordReset: async (email) => {
        const recaptchaAction = "FORGOT_PASSWORD";
        const recaptchaToken = await getRecaptchaToken(recaptchaAction);
        return api.post("/auth/password/forgot", { email, recaptchaToken, recaptchaAction });
    },

    changePassword: async (currentPassword, newPassword, confirmNewPassword) =>
        api.post("/auth/password/change", { currentPassword, newPassword, confirmNewPassword }),

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

    verifyEmail: async (userId, fullName, email) =>
        api.post("/auth/verify-email", {
            ...(userId ? { userId } : {}),
            ...(email ? { email } : {}),
            ...(fullName ? { fullName } : {}),
        }),

    processOAuth: async (accessToken, refreshToken) =>
        api.post("/auth/oauth/process", { accessToken, refreshToken }),

    completeOAuthOnboarding: async (profileData) =>
        api.post("/auth/oauth/onboarding", profileData),

    refreshToken: async (refreshToken) =>
        api.post("/auth/token/refresh", { refreshToken }),

    getAgreementContent: async () => api.get("/auth/agreement/content"),

    acceptAgreement: async () => api.post("/auth/agreement/accept"),
};
