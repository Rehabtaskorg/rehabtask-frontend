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
    5: "/therapist/onboarding/stripe",
};

export function getTherapistRedirect(pathname, { onboardingComplete, approvalStatus, onboardingStep }) {
    const isOnOnboardingRoute = pathname.startsWith("/therapist/onboarding");

    // Incomplete onboarding: force to correct wizard step (unless already on onboarding route)
    if (!onboardingComplete && !isOnOnboardingRoute) {
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