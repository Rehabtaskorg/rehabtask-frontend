const MARKETPLACE_ROUTES = [
    "/therapist/requests",
    "/therapist/offers",
    "/therapist/bookings",
    "/therapist/messages",
    "/therapist/earnings",
];

const ONBOARDING_STEP_ROUTES = {
    1: "/therapist/onboarding/profile",
    2: "/therapist/onboarding/credentials",
    3: "/therapist/onboarding/availability",
    4: "/therapist/onboarding/background-check",
    // 5: "/therapist/onboarding/stripe", // intentionally excluded - it's optional
};

export function getTherapistRedirect(pathname, { onboardingComplete, approvalStatus, onboardingStep }) {
    const isOnOnboardingRoute = pathname.startsWith("/therapist/onboarding");

    // Only block dashboard access for steps 1-4 (essential steps)
    // Step 5 (Stripe) is optional - therapist can explore the app
    if (!onboardingComplete && !isOnOnboardingRoute && onboardingStep < 5) {
        return ONBOARDING_STEP_ROUTES[onboardingStep] || "/therapist/onboarding/profile";
    }

    if (approvalStatus === "pending" || approvalStatus === "review" || approvalStatus === "rejected") {
        const isMarketplaceRoute = MARKETPLACE_ROUTES.some((r) => pathname.startsWith(r));
        if (isMarketplaceRoute) {
            return "/therapist/dashboard";
        }
    }

    // approved or no allowed route: no redirect
    return null;
}