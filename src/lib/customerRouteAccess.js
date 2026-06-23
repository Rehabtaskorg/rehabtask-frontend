import { CUSTOMER_TYPES } from "./constants";

export const AGENCY_ONBOARDING_STEP_ROUTES = {
    1: "/customer/onboarding/agency/welcome",
    2: "/customer/onboarding/agency/business-profile",
};

const SAFE_FALLBACK_ROUTE = "/customer/dashboard";

const ALLOWED_DURING_ONBOARDING = [
    "/customer/dashboard",
    "/customer/profile",
    "/customer/account-settings",
];

/**
 * Returns a redirect path if the customer should be redirected away from
 * the current route, or null if the route is allowed.
 *
 * @param {string} pathname
 * @param {{ customerType: string, onboardingComplete: boolean, onboardingStep: number }} opts
 * @returns {string|null}
 */
export function getCustomerRedirect(pathname, { customerType, onboardingComplete, onboardingStep }) {
    if (customerType !== CUSTOMER_TYPES.AGENCY) return null;

    const STEP_ROUTES = AGENCY_ONBOARDING_STEP_ROUTES;
    const isOnOnboardingRoute = pathname.startsWith("/customer/onboarding/agency");

    if (!onboardingComplete) {
        if (isOnOnboardingRoute) {
            const stepEntry = Object.entries(STEP_ROUTES)
                .find(([, route]) => pathname.startsWith(route));
            if (stepEntry) {
                const targetStep = parseInt(stepEntry[0], 10);
                if (targetStep > onboardingStep) {
                    return STEP_ROUTES[onboardingStep] ?? STEP_ROUTES[1];
                }
            }
            return null;
        }

        const isAllowed = ALLOWED_DURING_ONBOARDING.some((r) => pathname.startsWith(r));
        if (!isAllowed) {
            return STEP_ROUTES[onboardingStep] ?? STEP_ROUTES[1];
        }
    }

    return null;
}