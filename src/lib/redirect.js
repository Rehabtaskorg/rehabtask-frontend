/**
 * Validates a post-auth redirect target, rejecting anything that isn't a
 * same-origin relative path.
 *
 * @param {string | null | undefined} value - candidate redirect path, e.g. from `?redirect=`
 * @param {string} [fallback="/"]
 * @returns {string}
 */
export function getSafeRedirectPath(value, fallback = "/") {
    if (typeof value !== "string" || value.length === 0) return fallback;

    let decoded;
    try {
        decoded = decodeURIComponent(value);
    } catch {
        return fallback;
    }

    if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.startsWith("/\\")) {
        return fallback;
    }

    return decoded;
}