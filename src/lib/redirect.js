import { USER_ROLES } from "@/lib/constants";

const DESCRIPTOR_SEPARATOR = ":";

/**
 * Encodes a gated CTA into a `trigger:entityId` descriptor for the `?redirect=` param.
 * Resolved to a real dashboard path post-auth via {@link resolveAuthRedirectTarget}.
 *
 * @param {string} trigger - the gated action, e.g. "message", "offer", "request"
 * @param {string} entityId - id of the entity the action targets (profile id or user id)
 * @returns {string | null} encoded descriptor, or null if either input is missing
 */
export function encodeAuthRedirect(trigger, entityId) {
    if (!trigger || !entityId) return null;
    return `${trigger}${DESCRIPTOR_SEPARATOR}${entityId}`;
}

function decodeAuthRedirect(descriptor) {
    if (typeof descriptor !== "string") return null;
    const separatorIndex = descriptor.indexOf(DESCRIPTOR_SEPARATOR);
    if (separatorIndex <= 0 || separatorIndex === descriptor.length - 1) return null;

    return {
        trigger: descriptor.slice(0, separatorIndex),
        entityId: descriptor.slice(separatorIndex + 1),
    };
}

const TARGET_RESOLVERS = {
    [USER_ROLES.CUSTOMER]: {
        request: (entityId) => `/customer/requests/new?directTo=${entityId}`,
        message: (entityId) => `/customer/messages?c=new:${entityId}`,
        profile: (entityId) => `/customer/find-therapists/${entityId}`,
        contact: (entityId) => `/customer/find-therapists/${entityId}`,
    },
    [USER_ROLES.THERAPIST]: {
        offer: (entityId) => `/therapist/requests/${entityId}`,
    },
};

/**
 * Resolves an encoded redirect descriptor to a dashboard deep-link for the
 * authenticated user's role. Only whitelisted trigger/role combinations resolve —
 * anything else (including a role mismatch) returns null so the caller can fall
 * back to the user's own dashboard.
 *
 * @param {string | null | undefined} descriptor - encoded `trigger:entityId` value from `?redirect=`
 * @param {string | null} role - the authenticated user's role
 * @returns {string | null} resolved dashboard path, or null if there's no match
 */
export function resolveAuthRedirectTarget(descriptor, role) {
    const decoded = decodeAuthRedirect(descriptor);
    if (!decoded || !role) return null;

    const resolver = TARGET_RESOLVERS[role]?.[decoded.trigger];
    return resolver ? resolver(decoded.entityId) : null;
}