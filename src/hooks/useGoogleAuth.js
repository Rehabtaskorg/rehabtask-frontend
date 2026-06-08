import { supabase } from "@/lib/supabase";
import { AUTH_REDIRECT_STORAGE_KEY } from "@/lib/constants";

/**
 * @param {string | null} [redirectTo] - encoded `trigger:entityId` redirect descriptor to
 * resume at after the OAuth round trip; stashed in sessionStorage since query params don't
 * survive the provider redirect cycle, and resolved to a dashboard path by the oauth
 * callback/onboarding pages once the user's role is known.
 */
export const useGoogleAuth = (redirectTo = null) => {
    const initiateGoogleLogin = async () => {
        if (!supabase) {
            console.error("Supabase client not initialized");
            return { success: false, error: "Authentication service unavailable" };
        }

        try {
            if (redirectTo) {
                sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, redirectTo);
            } else {
                sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
            }

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/oauth/callback`,
                    queryParams: {
                        access_type: "offline",
                        prompt: "select_account",
                    }
                }
            });

            if (error) {
                console.error("Google OAuth error:", error);
                return { success: false, error: error.message };
            }

            // The redirect happens automatically, no need to return anything
            return { success: true, data };
        } catch (error) {
            console.error("Google OAuth initiation failed:", error);
            return {
                success: false,
                error: "Failed to initiate Google login. Please try again."
            };
        }
    };

    return { initiateGoogleLogin };
}