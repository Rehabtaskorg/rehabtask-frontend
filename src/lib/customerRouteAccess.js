import { CUSTOMER_TYPES } from "./constants";

export const AGENCY_ONBOARDING_STEP_ROUTES = {
    1: "/customer/onboarding/agency/welcome",
    2: "/customer/onboarding/agency/business-profile",
    3: "/customer/onboarding/agency/upload-documents",
    4: "/customer/onboarding/agency/compliance",
    5: "/customer/onboarding/agency/activation",
};

const SAFE_FALLBACK_ROUTE = "/customer/onboarding/agency/welcome";

const ALLOWED_DURING_ONBOARDING = [
    "/customer/dashboard",
    "/customer/profile",
    "/customer/account-settings",
];

/**
 * Returns a redirect path if the customer should be redirected away from
 * the current route, or null if the route is allowed.
 * Prevents skipping ahead in onboarding via direct URL — mirrors therapistRouteAccess.js.
 *
 * @param {string} pathname
 * @param {{ customerType: string, onboardingComplete: boolean, onboardingStep: number }} opts
 * @returns {string|null}
 */
export function getCustomerRedirect(pathname, { customerType, onboardingComplete, onboardingStep }) {
    if (customerType !== CUSTOMER_TYPES.AGENCY) return null;

    const isOnOnboardingRoute = pathname.startsWith("/customer/onboarding/agency");

    if (!onboardingComplete) {
        if (isOnOnboardingRoute) {
            const stepEntry = Object.entries(AGENCY_ONBOARDING_STEP_ROUTES)
                .find(([, route]) => pathname.startsWith(route));
            if (stepEntry) {
                const targetStep = parseInt(stepEntry[0], 10);
                if (targetStep > onboardingStep) {
                    return AGENCY_ONBOARDING_STEP_ROUTES[onboardingStep] ?? SAFE_FALLBACK_ROUTE;
                }
            }
            return null;
        }

        const isAllowed = ALLOWED_DURING_ONBOARDING.some((r) => pathname.startsWith(r));
        if (!isAllowed) {
            return AGENCY_ONBOARDING_STEP_ROUTES[onboardingStep] ?? SAFE_FALLBACK_ROUTE;
        }
    }

    return null;
}