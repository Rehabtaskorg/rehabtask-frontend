import { CUSTOMER_TYPES } from "./constants";

export const AGENCY_ONBOARDING_STEP_ROUTES = {
    1: "/customer/onboarding/agency/welcome",
    2: "/customer/onboarding/agency/business-profile",
    3: "/customer/onboarding/agency/upload-documents",
    4: "/customer/onboarding/agency/activation",
};

export const INDIVIDUAL_ONBOARDING_STEP_ROUTES = {
    1: "/customer/onboarding/individual/welcome",
    2: "/customer/onboarding/individual/personal-info",
    3: "/customer/onboarding/individual/medical-info",
    4: "/customer/onboarding/individual/activation",
};

/**
 * @param {string} pathname
 * @param {Record<number, string>} stepRoutes
 * @param {number} onboardingStep
 * @param {string} fallback
 * @returns {string|null}
 */
function resolveOnboardingRedirect(pathname, stepRoutes, onboardingStep, fallback) {
    const isOnOnboardingRoute = Object.values(stepRoutes).some((r) => pathname.startsWith(r));
    if (!isOnOnboardingRoute) return null;

    const stepEntry = Object.entries(stepRoutes).find(([, route]) => pathname.startsWith(route));
    if (stepEntry && parseInt(stepEntry[0], 10) > onboardingStep) {
        return stepRoutes[onboardingStep] ?? fallback;
    }

    return null;
}

// TODO: [NEXT] Add pre-onboarding page guards for customer marketplace routes.
// Pages that must be locked until onboardingComplete === true (mirror the therapist LockedPageOverlay pattern):
//   - /customer/requests         (My Requests)
//   - /customer/requests/new     (New Request — most critical)
//   - /customer/find-therapists  (Browse & contact therapists)
//   - /customer/bookings         (My Bookings — impossible pre-onboarding)
//   - /customer/disputes         (stems from bookings — impossible pre-onboarding)
//   - /customer/subscription     (only meaningful post-onboarding)
//   - /customer/patients         (agency-only — agency onboarding must complete first)
// Pages that must stay open: /customer/dashboard, /customer/profile, /customer/faqs
// Recommended approach: create a CustomerAccessContext (mirrors TherapistAccessContext),
// expose canAccessMarketplace = onboardingComplete, and add a guard at the top of each
// page component (same pattern as therapist pages). Reuse or generalise LockedPageOverlay.

/**
 * @param {string} pathname
 * @param {{ customerType: string, onboardingComplete: boolean, onboardingStep: number }} opts
 * @returns {string|null}
 */
export function getCustomerRedirect(pathname, { customerType, onboardingComplete, onboardingStep }) {
    const isOnAgencyRoute = pathname.startsWith("/customer/onboarding/agency");
    const isOnIndividualRoute = pathname.startsWith("/customer/onboarding/individual");

    if (customerType === CUSTOMER_TYPES.AGENCY) {
        if (isOnIndividualRoute) return "/customer/dashboard";
        if (onboardingComplete && isOnAgencyRoute) return "/customer/dashboard";
        if (!onboardingComplete) return resolveOnboardingRedirect(
            pathname,
            AGENCY_ONBOARDING_STEP_ROUTES,
            onboardingStep,
            AGENCY_ONBOARDING_STEP_ROUTES[1]
        );
    }

    if (customerType === CUSTOMER_TYPES.INDIVIDUAL) {
        if (isOnAgencyRoute) return "/customer/dashboard";
        if (onboardingComplete && isOnIndividualRoute) return "/customer/dashboard";
        if (!onboardingComplete) return resolveOnboardingRedirect(
            pathname,
            INDIVIDUAL_ONBOARDING_STEP_ROUTES,
            onboardingStep,
            INDIVIDUAL_ONBOARDING_STEP_ROUTES[1]
        );
    }

    if (isOnAgencyRoute || isOnIndividualRoute) return "/customer/dashboard";
    return null;
}