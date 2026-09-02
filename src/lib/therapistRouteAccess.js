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
    6: "/therapist/onboarding/identity",
    7: "/therapist/onboarding/stripe",
    8: "/therapist/onboarding/review",
};

/**
 * Onboarding routes that sit between numbered steps and so have no entry in
 * ONBOARDING_STEP_ROUTES. Maps each to the onboardingStep a therapist must have
 * reached for the route to be accessible, closing the direct-URL skip gap.
 */
const STEP_ROUTE_OVERRIDES = {
    "/therapist/onboarding/hipaa": 7,
};

const SAFE_FALLBACK_ROUTE = "/therapist/dashboard";

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
            const overrideEntry = Object.entries(STEP_ROUTE_OVERRIDES)
                .find(([route]) => pathname.startsWith(route));
            if (overrideEntry) {
                const requiredStep = overrideEntry[1];
                if (onboardingStep < requiredStep) {
                    return ONBOARDING_STEP_ROUTES[onboardingStep] || SAFE_FALLBACK_ROUTE;
                }
                return null;
            }

            const stepEntry = Object.entries(ONBOARDING_STEP_ROUTES)
                .find(([, route]) => pathname.startsWith(route));
            if (stepEntry) {
                const targetStep = parseInt(stepEntry[0], 10);
                if (targetStep > onboardingStep) {
                    return ONBOARDING_STEP_ROUTES[onboardingStep] || SAFE_FALLBACK_ROUTE;
                }
            }
            return null;
        }

        const isAllowed = ALLOWED_DURING_ONBOARDING.some((r) => pathname.startsWith(r));
        if (!isAllowed) {
            return ONBOARDING_STEP_ROUTES[onboardingStep] || SAFE_FALLBACK_ROUTE;
        }
    }

    return null;
}