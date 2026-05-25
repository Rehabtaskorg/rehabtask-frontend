export const DEFAULT_WORK_AREA_RADIUS_MILES = 25;

export const LICENSE_TYPE_TO_SERVICE_TYPE = Object.freeze({
    "Physical Therapist":               "Physical Therapy",
    "Physical Therapist Assistant":     "Physical Therapy",
    "Occupational Therapist":           "Occupational Therapy",
    "Occupational Therapist Assistant": "Occupational Therapy",
    "Speech-Language Pathologist":      "Speech Language Pathology (SLP)",
});

export const REQUEST_TYPE = {
    PUBLIC: "PUBLIC",
    DIRECT: "DIRECT",
};

export const MESSAGE_CONTEXT = {
    OFFER:   "offer",
    BOOKING: "booking",
    DIRECT:  "direct",
};

export const LOGOUT_REASON = {
    SESSION_EXPIRED: "session_expired",
    IDLE_TIMEOUT:    "idle_timeout",
    DEACTIVATED:     "deactivated",
    INVITED:         "invited",
};

export const PUBLIC_SEARCH_RADIUS_MILES = 50;

export const BOOKING_STATUS = {
    PENDING:              "pending",
    ACCEPTED:             "accepted",
    CONFIRMED:            "confirmed",
    IN_PROGRESS:          "in_progress",
    RESCHEDULE_REQUESTED: "reschedule_requested",
    FINALIZED:            "finalized",
    COMPLETED:            "completed",
    CANCELLED:            "cancelled",
};