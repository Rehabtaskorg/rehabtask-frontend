import { supabase } from "@/lib/supabase";

/**
 * Get minimal user info from Supabase session
 * This avoids making unnecessary API calls and doesn't expose sensitive data
 * 
 * @returns {Object|null} user info with role, or null if no session
 */
export const getSessionUserInfo = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            return null;
        }

        // Extract safe user metadata from Supabase session
        const { user } = session;

        return {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || null,
            fullName: user.user_metadata?.full_name || null,
            emailConfirmed: !!user.email_confirmed_at
        };
    } catch {
        return null;
    }
}

/**
 * Extract first name from full name
 * @param {string} fullName - Full name
 * @returns {string} First name
 */
export const getFirstName = (fullName) => {
    if (!fullName) return "";
    return fullName.split(" ")[0];
}