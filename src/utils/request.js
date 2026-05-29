import { CUSTOMER_TYPES } from "@/lib/constants";

/**
 * Returns a display label for the customer on a therapy request.
 * Agency customers show their agency name; individuals show "Individual Client"
 * to avoid exposing personal names on shared/therapist-facing views.
 *
 * @param {object|null} customer - CustomerProfile object from the API
 * @returns {string|null}
 */
export const getCustomerLabel = (customer) => {
    if (!customer) return null;
    if (customer.customerType === CUSTOMER_TYPES.AGENCY) {
        return customer.agencyName || customer.fullName;
    }
    return "Individual Client";
};
