import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { authAPi } from "@/services/auth.api";
import { logger } from "@/lib/logger";
import { AUTH_REDIRECT_STORAGE_KEY, AUTH_REDIRECT_PARAM } from "@/lib/constants";
import { resolveAuthRedirectTarget } from "@/lib/redirect";

function getDashboardPath(role) {
    const map = {
        customer: "/customer/dashboard",
        therapist: "/therapist/dashboard",
        admin: "/admin/dashboard",
    };
    return map[role] ?? "/dashboard";
}

/**
 * @param {string | null} [redirectTo] - encoded `trigger:entityId` redirect descriptor to
 * resume at after the OAuth round trip; stashed in sessionStorage since it must survive
 * the provider redirect cycle on mobile, and resolved to a dashboard path by the oauth
 * callback/onboarding pages once the user's role is known.
 */
export const useGoogleAuth = (redirectTo = null) => {
    const router = useRouter();

    const initiateGoogleLogin = async () => {
        try {
            if (redirectTo) {
                sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, redirectTo);
            } else {
                sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
            }

            const auth = getFirebaseAuth();
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });

            let firebaseUser;

            try {
                const result = await signInWithPopup(auth, provider);
                firebaseUser = result.user;
            } catch (popupError) {
                if (popupError.code === "auth/popup-closed-by-user") {
                    return { success: false, error: "Sign-in was cancelled." };
                }
                if (popupError.code === "auth/popup-blocked") {
                    await signInWithRedirect(auth, provider);
                    return { success: true, redirecting: true };
                }
                throw popupError;
            }

            const idToken = await firebaseUser.getIdToken();
            const response = await authAPi.processOAuth(idToken, firebaseUser.refreshToken);
            const { user } = response.data.data;

            if (user.needsOnboarding) {
                const onboardingTarget = redirectTo
                    ? `/oauth/onboarding?provider=google&${AUTH_REDIRECT_PARAM}=${encodeURIComponent(redirectTo)}`
                    : "/oauth/onboarding?provider=google";
                router.replace(onboardingTarget);
                return { success: true };
            }

            const target = resolveAuthRedirectTarget(redirectTo, user.role);
            router.replace(target ?? getDashboardPath(user.role));
            return { success: true };
        } catch (error) {
            logger.error("[useGoogleAuth] Google sign-in failed", error);
            return { success: false, error: "Failed to sign in with Google. Please try again." };
        }
    };

    return { initiateGoogleLogin };
};