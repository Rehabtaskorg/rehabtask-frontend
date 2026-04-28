import { supabase } from "@/lib/supabase";

export const useGoogleAuth = () => {
    const initiateGoogleLogin = async () => {
        if (!supabase) {
            console.error("Supabase client not initialized");
            return { success: false, error: "Authentication service unavailable" };
        }

        try {
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