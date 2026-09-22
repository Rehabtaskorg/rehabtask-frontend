import { api } from "@/lib/api";

export const CUSTOMER_KEYS = {
    all: ["customer"],
    profile: () => ["customer", "profile"],
};

const GENERIC_UPDATE_ERROR = "We couldn't save your changes. Please try again.";
const GENERIC_LOAD_ERROR = "We couldn't load your profile. Please try again.";
const GENERIC_DOCUMENT_ERROR = "We couldn't update that document. Please try again.";

/**
 * Translates a backend error into a message safe to render.
 * @param {unknown} error - Rejected axios error.
 * @param {string} fallback - Message used when the error isn't recognised.
 * @returns {Error} Error carrying a display-safe `message`.
 */
const toSafeError = (error, fallback) => {
    const status = error?.response?.status;
    const details = error?.response?.data?.errors;

    if (status === 403) {
        const fields = Array.isArray(details)
            ? details.map((item) => item.field).filter(Boolean)
            : [];
        const suffix = fields.length > 0 ? `: ${fields.join(", ")}` : "";
        const safe = new Error(
            `Some fields can't be changed while your application is under review${suffix}.`
        );
        safe.cause = error;
        return safe;
    }

    if (status === 400 && Array.isArray(details) && details.length > 0) {
        const fields = details.map((item) => item.field).filter(Boolean);
        const safe = new Error(
            fields.length > 0
                ? `Please check these fields and try again: ${fields.join(", ")}.`
                : fallback
        );
        safe.cause = error;
        return safe;
    }

    if (error?.isRateLimit) {
        const safe = new Error("Too many attempts. Please wait a moment and try again.");
        safe.cause = error;
        return safe;
    }

    const safe = new Error(fallback);
    safe.cause = error;
    return safe;
};

/**
 * Fetch the authenticated customer's full profile.
 * Includes review timestamps and both document relations.
 *
 * @returns {Promise<Object>} Customer profile.
 */
export const fetchCustomerProfile = async () => {
    try {
        const response = await api.get("/customers/profile");
        return response.data.data;
    } catch (error) {
        throw toSafeError(error, GENERIC_LOAD_ERROR);
    }
};

/**
 * Update mutable fields on the authenticated customer's profile.
 * Send only fields that actually changed — the backend flags the account for
 * re-review whenever a VERIFIED-tier field is present in the payload, changed
 * or not. Use `pickChangedFields` from the edit schema module to build `data`.
 *
 * @param {Object} data - Partial profile payload.
 * @returns {Promise<Object>} Updated customer profile.
 */
export const updateCustomerProfile = async (data) => {
    try {
        const response = await api.put("/customers/profile", data);
        return response.data.data;
    } catch (error) {
        throw toSafeError(error, GENERIC_UPDATE_ERROR);
    }
};

const documentBasePath = (isAgency) =>
    isAgency ? "/agency/onboarding" : "/individual/onboarding";

/**
 * Replace an existing customer document with a new upload. The backend
 * soft-deletes the old record and links the new one via `supersedesId`, so the
 * document type is inherited and must not be sent.
 *
 * @param {string} documentId - Document being superseded.
 * @param {File} file - Replacement file.
 * @param {boolean} isAgency - Routes to the agency or individual endpoint.
 * @returns {Promise<Object>} The newly created document record.
 */
export const replaceCustomerDocument = async (documentId, file, isAgency) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await api.post(
            `${documentBasePath(isAgency)}/document/${documentId}/replace`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            }
        );

        return response.data.data;
    } catch (error) {
        throw toSafeError(error, GENERIC_DOCUMENT_ERROR);
    }
};

/**
 * Get a short-lived signed URL for viewing a customer document.
 *
 * @param {string} documentId - Document to open.
 * @param {boolean} isAgency - Routes to the agency or individual endpoint.
 * @returns {Promise<{ signedUrl: string, expiresIn: number, fileName: string, fileSize: number }>}
 */
export const getCustomerDocumentUrl = async (documentId, isAgency) => {
    try {
        const response = await api.get(
            `${documentBasePath(isAgency)}/document/${documentId}`
        );
        return response.data.data;
    } catch (error) {
        throw toSafeError(error, GENERIC_DOCUMENT_ERROR);
    }
};
