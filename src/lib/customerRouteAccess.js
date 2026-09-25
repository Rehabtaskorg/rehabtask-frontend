import { CUSTOMER_TYPES, APPROVAL_STATUS } from "./constants";

export const CUSTOMER_GATE_STATE = {
    REJECTED: "rejected",
    INCOMPLETE: "incomplete",
    REVIEW: "review",
    NONE: "none",
};

/**
 * Derives the messaging/access gate state from a customer's profile.
 * Ordering is load-bearing: rejected always takes priority over incomplete.
 *
 * @param {{ approvalStatus: string|null, onboardingComplete: boolean }} customer
 * @returns {string} One of CUSTOMER_GATE_STATE values
 */
export function resolveCustomerGateState({ approvalStatus, onboardingComplete }) {
    if (approvalStatus === APPROVAL_STATUS.REJECTED) return CUSTOMER_GATE_STATE.REJECTED;
    if (!onboardingComplete) return CUSTOMER_GATE_STATE.INCOMPLETE;
    if (approvalStatus === APPROVAL_STATUS.APPROVED) return CUSTOMER_GATE_STATE.NONE;
    return CUSTOMER_GATE_STATE.REVIEW;
}

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

// TODO: [NEXT] Lock remaining customer marketplace routes using CustomerLockedPageOverlay.
// CA-10 locked /customer/requests/new and /customer/subscription (canAccessMarketplace gate).
// Still open (backend returns 403 on mutations but no designed lock screen on the page):
//   - /customer/requests         (My Requests list)
//   - /customer/find-therapists  (Browse & contact therapists)
//   - /customer/bookings         (My Bookings)
//   - /customer/disputes         (stems from bookings)
//   - /customer/patients         (agency-only)

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