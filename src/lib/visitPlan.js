/**
 * Visit Plan resolver — mirrors backend/src/utils/visitPlan.js.
 *
 * Precedence: booking > offer > request. A value set on a later layer
 * (e.g., booking) always wins over earlier layers. 
 */

/**
 * Canonical mapping from customer-facing service type to therapist discipline.
 * Must stay in sync with backend/src/utils/visitPlan.js.
 */
export const SERVICE_TYPE_TO_DISCIPLINE = Object.freeze({
    "Physical Therapy": "Physical Therapist",
    "Occupational Therapy": "Occupational Therapist",
    "Speech Language Pathology (SLP)": "Speech Therapist",
});

export const disciplineForServiceType = (serviceType) => {
    if (!serviceType) return null;
    return SERVICE_TYPE_TO_DISCIPLINE[serviceType] ?? null;
};

/**
 * Pull a visit type value (name or code) from a row at a single layer.
 */
const visitTypeFieldFrom = (row, field) => {
    if (!row) return undefined;
    if (row.visitTypeRef && row.visitTypeRef[field] != null) return row.visitTypeRef[field];
    if (field === "name" && row.visitType != null && typeof row.visitType === "string") return row.visitType;
    return undefined;
};

const visitTypeIdFrom = (row) => {
    if (!row) return undefined;
    if (row.visitTypeId != null) return row.visitTypeId;
    if (row.visitTypeRef?.id != null) return row.visitTypeRef.id;
    return undefined;
};

/**
 * @param {object} opts
 * @param {object} [opts.booking]
 * @param {object} [opts.offer]
 * @param {object} [opts.request]
 * @returns {{
 *   visitType: string|null,
 *   visitTypeCode: string|null,
 *   visitTypeId: string|null,
 *   visitsPerWeek: number|null,
 *   numberOfWeeks: number|null
 * }}
 */
export const resolveVisitPlan = ({ booking, offer, request } = {}) => ({
    visitType:
        visitTypeFieldFrom(booking, "name") ??
        visitTypeFieldFrom(offer, "name") ??
        visitTypeFieldFrom(request, "name") ??
        null,
    visitTypeCode:
        visitTypeFieldFrom(booking, "code") ??
        visitTypeFieldFrom(offer, "code") ??
        visitTypeFieldFrom(request, "code") ??
        null,
    visitTypeId:
        visitTypeIdFrom(booking) ??
        visitTypeIdFrom(offer) ??
        visitTypeIdFrom(request) ??
        null,
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
 * Resolves through the FK relation first, falling back to the legacy string
 * for visit type comparison.
 */
export const hasPlanOverride = (offer, request) => {
    if (!offer || !request) return false;

    // Visit type comparison — FK first, legacy string fallback
    const offerVT = visitTypeFieldFrom(offer, "name");
    const requestVT = visitTypeFieldFrom(request, "name");
    if (offerVT != null && requestVT != null && offerVT !== requestVT) return true;

    // Visit type code (FK only — legacy rows don't have codes, so no false positives)
    const offerCode = visitTypeFieldFrom(offer, "code");
    const requestCode = visitTypeFieldFrom(request, "code");
    if (offerCode != null && requestCode != null && offerCode !== requestCode) return true;

    if (offer.visitsPerWeek != null && offer.visitsPerWeek !== request.visitsPerWeek) return true;
    if (offer.numberOfWeeks != null && offer.numberOfWeeks !== request.numberOfWeeks) return true;
    return false;
};
