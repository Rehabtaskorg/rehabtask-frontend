export const ASSISTANT_NAME = "Alex";

const GREETING = {
    public: `Hi! I'm ${ASSISTANT_NAME} with RehabTask. We help connect licensed therapists with home health agencies and patients who need in-home care, and it's free for therapists to join.\n\nJust so I can point you in the right direction, are you a Physical Therapist, Occupational Therapist, Speech Therapist, with a home health agency, or looking for care for yourself or a family member?`,
    default: `Hi! I'm ${ASSISTANT_NAME}. Ask me anything about using RehabTask.`,
};

export const getGreeting = (audience) => ({
    role: "assistant",
    content: GREETING[audience] ?? GREETING.default,
});

export const PHI_NOTICE =
    "Please don't include sensitive medical or patient information in this chat.";

export const SUPPORT_EMAIL = "support@rehabtask.com";

const SUGGESTED_QUESTIONS = {
    customer: [
        "How do I find a therapist?",
        "How do bookings work?",
        "Where are my appointments?",
        "How do I contact support?",
    ],
    therapist: [
        "How do I complete my profile?",
        "How do I update availability?",
        "How do payouts work?",
        "How do I find cases?",
    ],
    agency: [
        "How do I add a patient?",
        "How do I create a referral?",
        "How do I find a therapist?",
        "How do bookings work?",
    ],
};

export const getSuggestedQuestions = (audience) => SUGGESTED_QUESTIONS[audience] ?? [];
