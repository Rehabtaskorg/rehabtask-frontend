"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { authAPi } from "@/services/auth.api";
import { logger } from "@/lib/logger";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AUTH_REDIRECT_PARAM, ROLE_DASHBOARDS } from "@/lib/constants";
import { popAuthRedirect, resolveAuthRedirectTarget } from "@/lib/redirect";


const OAuthCallback = () => {
    usePageTitle("Signing In");
    const router = useRouter();
    const [statusMessage, setStatusMessage] = useState("Completing sign in...");
    const hasProcessed = useRef(false);

    useEffect(() => {
        const handleRedirectResult = async () => {
            if (hasProcessed.current) return;
            hasProcessed.current = true;

            try {
                const params = new URLSearchParams(window.location.search);
                if (params.get("error")) {
                    router.replace("/login?message=Login was cancelled");
                    return;
                }

                const result = await getRedirectResult(getFirebaseAuth());

                if (!result) {
                    router.replace("/login");
                    return;
                }

                setStatusMessage("Signing you in...");

                const idToken = await result.user.getIdToken(true);
                const refreshToken = result.user.refreshToken;

                const response = await authAPi.processOAuth(idToken, refreshToken);
                const { user } = response.data.data;

                const redirectDescriptor = popAuthRedirect();

                if (user.needsOnboarding) {
                    const onboardingTarget = redirectDescriptor
                        ? `/oauth/onboarding?provider=google&${AUTH_REDIRECT_PARAM}=${encodeURIComponent(redirectDescriptor)}`
                        : "/oauth/onboarding?provider=google";
                    router.replace(onboardingTarget);
                    return;
                }

                const target = resolveAuthRedirectTarget(redirectDescriptor, user.role);
                router.replace(target ?? ROLE_DASHBOARDS[user.role] ?? "/login");
            } catch (error) {
                logger.error("[OAuthCallback] Redirect result processing failed", error);
                router.replace(`/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`);
            }
        };

        handleRedirectResult();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="flex flex-col items-center max-w-sm w-full text-center">
                <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-primary animate-spin"></div>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Just a moment</h1>
                <p className="text-gray-600 animate-pulse text-sm">{statusMessage}</p>
            </div>
        </div>
    );
};

export default OAuthCallback;