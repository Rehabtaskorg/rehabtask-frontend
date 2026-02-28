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
                    router.replace("/login?message=Login was cancelled");
                    return;
                }

                // 3. Exchange hash for session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (!session) {
                    router.replace("/login");
                    return;
                }

                setStatusMessage("Signing you in...");

                const response = await authAPi.processOAuth(
                    session.access_token,
                    session.refresh_token
                );

                const { user } = response.data.data;

                if (user.needsOnboarding) {
                    router.replace("/oauth/onboarding?provider=google");
                } else {
                    const dashboardMap = {
                        customer: "/customer/dashboard",
                        therapist: "/therapist/dashboard",
                        admin: "/admin/dashboard"
                    };

                    const target = dashboardMap[user.role] || "/dashboard";
                    router.replace(target);
                }

            } catch (error) {
                console.error("OAuth process failed:", error);
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
