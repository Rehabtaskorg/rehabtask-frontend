import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log a warning instead of throwing an error to prevent build failure
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are missing. This is expected during static prerendering if variables aren't injected yet.");
}

// Create the client only if variables exists, otherwise export null
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;