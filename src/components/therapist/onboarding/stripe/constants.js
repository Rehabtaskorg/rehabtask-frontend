/** State machine statuses for the Stripe onboarding flow. */
export const STRIPE_STATUS = {
    INITIALIZING: "initializing",
    IDLE: "idle",
    CREATING: "creating",
    ONBOARDING: "onboarding",
    VERIFYING: "verifying",
    COMPLETE: "complete",
    ERROR: "error",
};

/** Delay before the automatic retry attempt on a transient SDK load failure. */
export const AUTO_RETRY_DELAY_MS = 1500;