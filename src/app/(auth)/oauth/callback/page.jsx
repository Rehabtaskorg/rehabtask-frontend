"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authAPi } from "@/lib/auth.api";
import { usePageTitle } from "@/hooks/usePageTitle";

const OAuthCallback = () => {
    usePageTitle("Signing In");
    const router = useRouter();
    const [statusMessage, setStatusMessage] = useState("Completing sign in...");
    const hasProcessed = useRef(false);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            try {
                const params = new URLSearchParams(window.location.search);
                const errorDescription = params.get('error_description');

                if (errorDescription?.includes("access_denied") || params.get('error')) {
                    console.log("[OAuth] User cancelled or error param:", params.get('error'));
                    router.replace("/login?message=Login was cancelled");
                    return;
                }

                console.log("[OAuth] Calling supabase.auth.getSession()...");
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                console.log("[OAuth] getSession result — session:", !!session, "error:", sessionError?.message);

                if (sessionError) throw sessionError;

                if (!session) {
                    console.log("[OAuth] No session found — redirecting to login");
                    router.replace("/login");
                    return;
                }

                console.log("[OAuth] Session obtained. access_token prefix:", session.access_token?.slice(0, 20));
                setStatusMessage("Signing you in...");

                console.log("[OAuth] Calling processOAuth...");
                const response = await authAPi.processOAuth(
                    session.access_token,
                    session.refresh_token
                );
                console.log("[OAuth] processOAuth success — user:", response.data.data.user?.role, "needsOnboarding:", response.data.data.user?.needsOnboarding);

                const { user } = response.data.data;

                console.log("[OAuth] Calling supabase.auth.signOut scope:local...");
                const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
                console.log("[OAuth] signOut result — error:", signOutError?.message ?? "none");

                if (user.needsOnboarding) {
                    console.log("[OAuth] Redirecting to onboarding");
                    router.replace("/oauth/onboarding?provider=google");
                } else {
                    const dashboardMap = {
                        customer: "/customer/dashboard",
                        therapist: "/therapist/dashboard",
                        admin: "/admin/dashboard"
                    };
                    const target = dashboardMap[user.role] || "/dashboard";
                    console.log("[OAuth] Redirecting to dashboard:", target);
                    router.replace(target);
                }

            } catch (error) {
                console.error("[OAuth] Process failed:", error?.response?.status, error?.response?.data || error?.message);
                router.replace(`/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`);
            }
        };

        handleOAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-background-dark p-4">
            <div className="flex flex-col items-center max-w-sm w-full text-center">
                <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-primary animate-spin"></div>
                </div>

                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Just a moment
                </h1>
                <p className="text-gray-600 dark:text-gray-400 animate-pulse text-sm">
                    {statusMessage}
                </p>
            </div>
        </div>
    );
};

export default OAuthCallback;
