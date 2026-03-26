const MARKETPLACE_ROUTES = [
    "/therapist/requests",
    "/therapist/offers",
    "/therapist/bookings",
    "/therapist/messages",
    "/therapist/earnings",
];

export const ONBOARDING_STEP_ROUTES = {
    1: "/therapist/onboarding/profile",
    2: "/therapist/onboarding/credentials",
    3: "/therapist/onboarding/availability",
    4: "/therapist/onboarding/background-check",
    // 5: "/therapist/onboarding/stripe", // intentionally excluded - it's optional
};

// Pages therapists can access while onboarding is incomplete
// Marketplace routes are included so they render the LockedPageOverlay instead of redirecting
const ALLOWED_DURING_ONBOARDING = [
    "/therapist/dashboard",
    "/therapist/profile",
    "/therapist/account-settings",
    ...MARKETPLACE_ROUTES,
];

export function getTherapistRedirect(pathname, { onboardingComplete, approvalStatus, onboardingStep }) {
    const isOnOnboardingRoute = pathname.startsWith("/therapist/onboarding");

    if (!onboardingComplete && onboardingStep < 5) {
        // Prevent skipping ahead in onboarding steps via direct URL
        if (isOnOnboardingRoute) {
            const stepEntry = Object.entries(ONBOARDING_STEP_ROUTES)
                .find(([, route]) => pathname.startsWith(route));
            if (stepEntry) {
                const targetStep = parseInt(stepEntry[0], 10);
                if (targetStep > onboardingStep) {
                    return ONBOARDING_STEP_ROUTES[onboardingStep] || "/therapist/onboarding/profile";
                }
            }
            return null;
        }

        // Allow dashboard, profile, and account settings during onboarding
        const isAllowed = ALLOWED_DURING_ONBOARDING.some((r) => pathname.startsWith(r));
        if (!isAllowed) {
            return ONBOARDING_STEP_ROUTES[onboardingStep] || "/therapist/onboarding/profile";
        }
    }

    // Marketplace routes are no longer redirected — each page renders LockedPageOverlay when not approved

    return null;
}