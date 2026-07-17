export const DEFAULT_WORK_AREA_RADIUS_MILES = 25;

export const MAX_SEARCH_RADIUS_MILES = 100;
export const RADIUS_FILTER_STEP_MILES = 25;
export const MAX_VISIT_TITLE_LENGTH = 100;

export const USER_ROLES = {
    CUSTOMER: "customer",
    THERAPIST: "therapist",
    ADMIN: "admin",
    SUB_ADMIN: "sub_admin",
};

export const CUSTOMER_TYPES = {
    AGENCY: "agency",
    INDIVIDUAL: "individual",
};

export const APPROVAL_STATUS = {
    PENDING: "pending",
    REVIEW: "review",
    APPROVED: "approved",
    REJECTED: "rejected",
};

export const LICENSE_TYPE_TO_SERVICE_TYPE = Object.freeze({
    "Physical Therapist": "Physical Therapy",
    "Physical Therapist Assistant": "Physical Therapy",
    "Occupational Therapist": "Occupational Therapy",
    "Occupational Therapist Assistant": "Occupational Therapy",
    "Speech-Language Pathologist": "Speech Language Pathology (SLP)",
});

export const REQUEST_TYPE = {
    PUBLIC: "PUBLIC",
    DIRECT: "DIRECT",
};

export const MESSAGE_CONTEXT = {
    OFFER: "offer",
    BOOKING: "booking",
    DIRECT: "direct",
};

export const LOGOUT_REASON = {
    SESSION_EXPIRED: "session_expired",
    IDLE_TIMEOUT: "idle_timeout",
    DEACTIVATED: "deactivated",
    INVITED: "invited",
    EMAIL_VERIFIED: "verified",
    LOGGED_OUT: "logged_out",
};

export const AUTH_REDIRECT_PARAM = "redirect";
export const AUTH_REDIRECT_STORAGE_KEY = "pending_auth_redirect";

export const PUBLIC_SEARCH_RADIUS_MILES = 50;

export const SESSION_STATUS = {
    PENDING_SCHEDULE: "pending_schedule",
    SCHEDULED: "scheduled",
    IN_PROGRESS: "in_progress",
    CONFIRMED_BY_CUSTOMER: "confirmed_by_customer",
    MISSED: "missed",
    ATTEMPTED: "attempted",
    CANCELLED: "cancelled",
    CANCELLATION_REQUESTED: "cancellation_requested",
};

export const PLAN_TYPES = {
    FREE: "free",
    PRO: "pro",
    ENTERPRISE: "enterprise",
    UNLIMITED: "unlimited",
};

export const BOOKING_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    CONFIRMED: "confirmed",
    IN_PROGRESS: "in_progress",
    RESCHEDULE_REQUESTED: "reschedule_requested",
    FINALIZED: "finalized",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    CANCELLATION_REQUESTED: "cancellation_requested",
};