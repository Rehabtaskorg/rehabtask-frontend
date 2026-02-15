"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authAPi } from "@/lib/auth.api";

const ONBOARDING_ROUTES = [
    "/therapist/onboarding/profile",
    "/therapist/onboarding/credentials",
    "/therapist/onboarding/availability",
    "/therapist/onboarding/background-check",
    "/therapist/onboarding/stripe",
    "/therapist/onboarding/pending",
];

export default function OnboardingGuard({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    const checkOnboardingStatus = useCallback(async () => {
        try {
            const res = await authAPi.getCurrentUser();
            const userData = res.data.data.user;

            if (userData.role === "therapist") {
                const profile = userData.therapistProfile;

                const isComplete = profile?.onboardingComplete ?? false;
                const approvalStatus = profile?.approvalStatus ?? "pending";

                const isOnboardingRoute = ONBOARDING_ROUTES.some((route) =>
                    pathname.startsWith(route)
                );

                if (!isComplete && !isOnboardingRoute) {
                    const currentStep = profile?.onboardingStep ?? 1;

                    const stepRoutes = {
                        1: "/therapist/onboarding/profile",
                        2: "/therapist/onboarding/credentials",
                        3: "/therapist/onboarding/availability",
                        4: "/therapist/onboarding/background-check",
                        5: "/therapist/onboarding/stripe",
                    };

                    router.replace(
                        stepRoutes[currentStep] ||
                        "/therapist/onboarding/profile"
                    );
                    return;
                }

                if (isComplete && (approvalStatus === "pending" || approvalStatus === "review") && pathname !== "/therapist/onboarding/pending") {
                    router.replace("/therapist/onboarding/pending");
                    return;
                }

                if (isComplete && approvalStatus === "approved" && pathname !== "/therapist/dashboard") {
                    router.replace("/therapist/dashboard");
                    return;
                }
            }

            setLoading(false);
        } catch (error) {
            console.error("Onboarding guard error:", error);
            setLoading(false);
        }
    }, [pathname, router]);

    useEffect(() => {
        const initialize = async () => {
            await checkOnboardingStatus();
        };

        initialize();
    }, [checkOnboardingStatus]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-input-dark">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return children;
}