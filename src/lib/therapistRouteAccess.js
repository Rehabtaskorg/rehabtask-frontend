const MARKETPLACE_ROUTES = [
    "/therapist/requests",
    "/therapist/offers",
    "/therapist/bookings",
    "/therapist/messages",
    "/therapist/earnings",
];

export const ONBOARDING_STEP_ROUTES = {
    1: "/therapist/onboarding/personal-info",
    2: "/therapist/onboarding/profile",
    3: "/therapist/onboarding/credentials",
    4: "/therapist/onboarding/availability",
    5: "/therapist/onboarding/insurance",
    // Steps 6–8 (identity, compliance, stripe) added as they are built
};

// Pages therapists can access while onboarding is incomplete
// Marketplace routes are included so they render the LockedPageOverlay instead of redirecting
const ALLOWED_DURING_ONBOARDING = [
    "/therapist/dashboard",
    "/therapist/profile",
    "/therapist/account-settings",
    ...MARKETPLACE_ROUTES,
];

export function getTherapistRedirect(pathname, { onboardingComplete, onboardingStep }) {
    const isOnOnboardingRoute = pathname.startsWith("/therapist/onboarding");

    if (!onboardingComplete && onboardingStep < 8) {
        // Prevent skipping ahead in onboarding steps via direct URL
        if (isOnOnboardingRoute) {
            const stepEntry = Object.entries(ONBOARDING_STEP_ROUTES)
                .find(([, route]) => pathname.startsWith(route));
            if (stepEntry) {
                const targetStep = parseInt(stepEntry[0], 10);
                if (targetStep > onboardingStep) {
                    return ONBOARDING_STEP_ROUTES[onboardingStep] || "/therapist/onboarding/personal-info";
                }
            }
            return null;
        }

        // Allow dashboard, profile, and account settings during onboarding
        const isAllowed = ALLOWED_DURING_ONBOARDING.some((r) => pathname.startsWith(r));
        if (!isAllowed) {
            return ONBOARDING_STEP_ROUTES[onboardingStep] || "/therapist/onboarding/personal-info";
        }
    }

    // Marketplace routes are no longer redirected — each page renders LockedPageOverlay when not approved

    return null;
}