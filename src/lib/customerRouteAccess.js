import { CUSTOMER_TYPES } from "./constants";

export const AGENCY_ONBOARDING_STEP_ROUTES = {
    1: "/customer/onboarding/agency/welcome",
    2: "/customer/onboarding/agency/business-profile",
    3: "/customer/onboarding/agency/upload-documents",
    4: "/customer/onboarding/agency/compliance",
    5: "/customer/onboarding/agency/activation",
};

export const INDIVIDUAL_ONBOARDING_STEP_ROUTES = {
    1: "/customer/onboarding/individual/welcome",
    2: "/customer/onboarding/individual/personal-info",
    3: "/customer/onboarding/individual/medical-info",
    4: "/customer/onboarding/individual/consent-forms",
    5: "/customer/onboarding/individual/activation",
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
        if (onboardingComplete) return null;
        return resolveOnboardingRedirect(
            pathname,
            AGENCY_ONBOARDING_STEP_ROUTES,
            onboardingStep,
            AGENCY_ONBOARDING_STEP_ROUTES[1]
        );
    }

    if (customerType === CUSTOMER_TYPES.INDIVIDUAL) {
        if (isOnAgencyRoute) return "/customer/dashboard";
        if (onboardingComplete) return null;
        return resolveOnboardingRedirect(
            pathname,
            INDIVIDUAL_ONBOARDING_STEP_ROUTES,
            onboardingStep,
            INDIVIDUAL_ONBOARDING_STEP_ROUTES[1]
        );
    }

    if (isOnAgencyRoute || isOnIndividualRoute) return "/customer/dashboard";
    return null;
}