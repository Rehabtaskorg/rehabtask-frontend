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

export const ROLE_DASHBOARDS = {
    [USER_ROLES.CUSTOMER]: "/customer/dashboard",
    [USER_ROLES.THERAPIST]: "/therapist/dashboard",
    [USER_ROLES.ADMIN]: "/admin/dashboard",
    [USER_ROLES.SUB_ADMIN]: "/admin/dashboard",
};

export const CUSTOMER_TYPES = {
    AGENCY: "agency",
    INDIVIDUAL: "individual",
};

export const CUSTOMER_TYPE_OPTIONS = Object.freeze([
    { value: CUSTOMER_TYPES.INDIVIDUAL, label: "Individual Patient", icon: "MdPerson" },
    { value: CUSTOMER_TYPES.AGENCY, label: "Home Health Agency", icon: "MdBusiness" },
]);

export const APPROVAL_STATUS = {
    PENDING: "pending",
    REVIEW: "review",
    APPROVED: "approved",
    REJECTED: "rejected",
};

export const MESSAGE_GATE_ERROR_CODES = new Set([
    "FORBIDDEN",
    "ONBOARDING_INCOMPLETE",
    "NOT_APPROVED",
]);

export const LICENSE_TYPE_TO_SERVICE_TYPE = Object.freeze({
    "Physical Therapist": "Physical Therapy",
    "Physical Therapist Assistant": "Physical Therapy",
    "Occupational Therapist": "Occupational Therapy",
    "Occupational Therapist Assistant": "Occupational Therapy",
    "Speech-Language Pathologist": "Speech Language Pathology (SLP)",
});

export const LICENSE_TYPE_TO_DISCIPLINE = Object.freeze({
    "Physical Therapist": "PT",
    "Physical Therapist Assistant": "PTA",
    "Occupational Therapist": "OT",
    "Occupational Therapist Assistant": "COTA",
    "Speech-Language Pathologist": "SLP",
});

export const DISCIPLINE_PILLS = Object.freeze([
    { key: "all", label: "All", licenseTypes: [] },
    { key: "pt", label: "PT", licenseTypes: ["Physical Therapist", "Physical Therapist Assistant"] },
    { key: "ot", label: "OT", licenseTypes: ["Occupational Therapist", "Occupational Therapist Assistant"] },
    { key: "slp", label: "SLP", licenseTypes: ["Speech-Language Pathologist"] },
]);

export const REQUEST_STATUS = {
    CREATED: "created",
    OFFERS_RECEIVED: "offers_received",
    OFFERS_ACCEPTED: "offers_accepted",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

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

export const AUTH_GATE_TRIGGERS = Object.freeze({
    MESSAGE: "message",
    CONTACT: "contact",
    PROFILE: "profile",
    REQUEST: "request",
    OFFER: "offer",
    REFERRAL: "referral",
    DEFAULT: "default",
});

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

export const THERAPIST_VERIFICATION_FIELDS = Object.freeze({
    LICENSE: "licenseVerified",
    INSURANCE: "insuranceVerified",
});
export const STRIPE_BUSINESS_STRUCTURE = {
    INDIVIDUAL: "individual",
    SOLE_PROPRIETORSHIP: "sole_proprietorship",
    SINGLE_MEMBER_LLC: "single_member_llc",
    MULTI_MEMBER_LLC: "multi_member_llc",
    PRIVATE_CORPORATION: "private_corporation",
};

export const STRIPE_COMPANY_STRUCTURES = new Set([
    STRIPE_BUSINESS_STRUCTURE.SOLE_PROPRIETORSHIP,
    STRIPE_BUSINESS_STRUCTURE.SINGLE_MEMBER_LLC,
    STRIPE_BUSINESS_STRUCTURE.MULTI_MEMBER_LLC,
    STRIPE_BUSINESS_STRUCTURE.PRIVATE_CORPORATION,
]);
