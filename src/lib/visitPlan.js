/**
 * Visit Plan resolver — mirrors backend/src/utils/visitPlan.js.
 *
 * Precedence: booking > offer > request. A value set on a later layer
 * (e.g., booking) always wins over earlier layers. NULL/undefined on any
 * layer falls through to the next. This is the ONLY place display
 * components should encode the fallback rule.
 *
 * See docs/VISIT-PLAN-OVERRIDE.md for the full design rationale.
 */

/**
 * @param {object} opts
 * @param {object} [opts.booking]
 * @param {object} [opts.offer]
 * @param {object} [opts.request]
 * @returns {{visitType: string|null, visitsPerWeek: number|null, numberOfWeeks: number|null}}
 */
export const resolveVisitPlan = ({ booking, offer, request } = {}) => ({
    visitType:     booking?.visitType     ?? offer?.visitType     ?? request?.visitType     ?? null,
    visitsPerWeek: booking?.visitsPerWeek ?? offer?.visitsPerWeek ?? request?.visitsPerWeek ?? null,
    numberOfWeeks: booking?.numberOfWeeks ?? offer?.numberOfWeeks ?? request?.numberOfWeeks ?? null,
});

/**
 * Compute total visits from a resolved plan. Returns null if either leg of
 * the frequency is missing (callers should treat null as "single-session").
 *
 * @param {{visitsPerWeek: number|null, numberOfWeeks: number|null}} plan
 * @returns {number|null}
 */
export const computeTotalVisits = (plan) => {
    if (plan?.visitsPerWeek && plan?.numberOfWeeks) {
        return plan.visitsPerWeek * plan.numberOfWeeks;
    }
    return null;
};

/**
 * Returns true if the offer proposes at least one field that differs from the
 * parent request — i.e., the customer should see a "proposed plan" diff card.
 *
 * A NULL on the offer means "no override at this field" and is NOT a diff,
 * even if the request has a value.
 */
export const hasPlanOverride = (offer, request) => {
    if (!offer || !request) return false;
    if (offer.visitType != null && offer.visitType !== request.visitType) return true;
    if (offer.visitsPerWeek != null && offer.visitsPerWeek !== request.visitsPerWeek) return true;
    if (offer.numberOfWeeks != null && offer.numberOfWeeks !== request.numberOfWeeks) return true;
    return false;
};
