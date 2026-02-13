"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authAPi } from "@/lib/auth.api";

const OAuthCallback = () => {
    const router = useRouter();
    const [statusMessage, setStatusMessage] = useState("Completing sign in...");
    const hasProcessed = useRef(false);

    // useEffect(() => {
    //     const handleOAuthCallback = async () => {
    //         if (hasProcessed.current) return;
    //         hasProcessed.current = true;

    //         try {
    //             // ✅ Check URL params
    //             console.log("1. Full URL:", window.location.href);

    //             const params = new URLSearchParams(window.location.search);

    //             // 3. Exchange hash for session
    //             const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    //             if (sessionError) throw sessionError;

    //             if (!session) {
    //                 router.replace("/login");
    //                 return;
    //             }

    //             setStatusMessage("Syncing your profile...");

    //             const response = await authAPi.processOAuth(
    //                 session.access_token,
    //                 session.refresh_token
    //             );

    //             const { user } = response.data.data;

    //             if (user.needsOnboarding) {
    //                 router.replace("/oauth/onboarding?provider=google");
    //             } else {
    //                 const dashboardMap = {
    //                     customer: "/customer/dashboard",
    //                     therapist: "/therapist/dashboard",
    //                     admin: "/admin/dashboard"
    //                 };

    //                 const target = dashboardMap[user.role] || "/dashboard";
    //                 router.replace(target);
    //             }

    //         } catch (error) {
    //             console.error("OAuth process failed:", error);
    //             // UX: Give a clear path back if something breaks
    //             router.replace(`/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`);
    //         }
    //     };

    //     handleOAuthCallback();
    // }, [router]);

    // In /oauth/callback/page.jsx
    useEffect(() => {
        const handleOAuthCallback = async () => {
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            try {
                // ✅ Check URL params
                console.log("1. Full URL:", window.location.href);

                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                console.log("2. Supabase session:", session);

                if (!session) {
                    console.log("3. No session - redirecting to login");
                    router.replace("/login");
                    return;
                }

                setStatusMessage("Syncing your profile...");

                console.log("4. Calling processOAuth...");
                const response = await authAPi.processOAuth(
                    session.access_token,
                    session.refresh_token
                );

                console.log("5. processOAuth response:", response.data);

                // ✅✅✅ CHECK COOKIES AFTER processOAuth ✅✅✅
                console.log("6. Cookies after processOAuth:", document.cookie);
                console.log("7. Cookie count:", document.cookie.split(';').length);

                const { user } = response.data.data;

                if (user.needsOnboarding) {
                    console.log("8. User needs onboarding - redirecting");
                    router.replace("/oauth/onboarding?provider=google");
                } else {
                    console.log("9. User complete - redirecting to dashboard");
                    const dashboardMap = {
                        customer: "/customer/dashboard",
                        therapist: "/therapist/dashboard",
                        admin: "/admin/dashboard"
                    };
                    const target = dashboardMap[user.role] || "/dashboard";
                    router.replace(target);
                }

            } catch (error) {
                console.error("❌ OAuth callback error:", error);
                console.error("❌ Error response:", error.response?.data);
                router.replace(`/login?error=${encodeURIComponent("Authentication failed")}`);
            }
        };

        handleOAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-background-dark p-4">
            <div className="flex flex-col items-center max-w-sm w-full text-center">
                {/* Modern loading indicator */}
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
