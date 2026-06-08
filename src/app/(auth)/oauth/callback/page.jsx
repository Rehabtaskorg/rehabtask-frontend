"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { authAPi } from "@/lib/auth.api";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AUTH_REDIRECT_STORAGE_KEY, AUTH_REDIRECT_PARAM } from "@/lib/constants";
import { resolveAuthRedirectTarget } from "@/lib/redirect";

/** Reads and clears the pending post-auth redirect descriptor stashed before the OAuth handoff. */
function consumePendingRedirect() {
    const stored = sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
    return stored;
}

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

                // No signOut call needed — persistSession:false means nothing
                // was written to localStorage, so there is nothing to clear.
                // Calling signOut here risks invalidating the Supabase session
                // whose tokens are now stored in the backend httpOnly cookies.

                const redirectDescriptor = consumePendingRedirect();

                if (user.needsOnboarding) {
                    console.log("[OAuth] Redirecting to onboarding");
                    const onboardingTarget = redirectDescriptor
                        ? `/oauth/onboarding?provider=google&${AUTH_REDIRECT_PARAM}=${encodeURIComponent(redirectDescriptor)}`
                        : "/oauth/onboarding?provider=google";
                    router.replace(onboardingTarget);
                    return;
                }

                const target = resolveAuthRedirectTarget(redirectDescriptor, user.role);

                if (target) {
                    console.log("[OAuth] Redirecting to resolved target:", target);
                    router.replace(target);
                } else {
                    const dashboardMap = {
                        customer: "/customer/dashboard",
                        therapist: "/therapist/dashboard",
                        admin: "/admin/dashboard"
                    };
                    const dashboardTarget = dashboardMap[user.role] || "/dashboard";
                    console.log("[OAuth] Redirecting to dashboard:", dashboardTarget);
                    router.replace(dashboardTarget);
                }

            } catch (error) {
                console.error("[OAuth] Process failed:", error?.response?.status, error?.response?.data || error?.message);
                router.replace(`/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`);
            }
        };

        handleOAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50  p-4">
            <div className="flex flex-col items-center max-w-sm w-full text-center">
                <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-primary animate-spin"></div>
                </div>

                <h1 className="text-xl font-bold text-gray-900  mb-2">
                    Just a moment
                </h1>
                <p className="text-gray-600  animate-pulse text-sm">
                    {statusMessage}
                </p>
            </div>
        </div>
    );
};

export default OAuthCallback;
