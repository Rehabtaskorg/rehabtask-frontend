import { CUSTOMER_TYPES, USER_ROLES } from "@/lib/constants";

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

export const CHAT_INVITE = {
    message: "Questions about RehabTask? Ask Alex.",
};

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

export const getDashboardAudience = ({ role, customerType }) => {
    if (role === USER_ROLES.THERAPIST) return "therapist";
    if (role !== USER_ROLES.CUSTOMER) return null;
    return customerType === CUSTOMER_TYPES.AGENCY ? "agency" : "customer";
};

export const LEAD_ROLE_OPTIONS = [
    { value: "pt", label: "Physical Therapist" },
    { value: "ot", label: "Occupational Therapist" },
    { value: "slp", label: "Speech Therapist" },
    { value: "pta", label: "PT Assistant" },
    { value: "cota", label: "OT Assistant" },
    { value: "agency", label: "Home health agency" },
    { value: "patient", label: "Patient or family" },
];

export const LEAD_CATEGORY_OPTIONS = [
    { value: "booking", label: "Booking Issue" },
    { value: "payment", label: "Payments or Billing" },
    { value: "account", label: "Account or Login" },
    { value: "verification", label: "Verification or Documents" },
    { value: "joining", label: "Joining RehabTask" },
    { value: "other", label: "Something Else" },
];

export const LEAD_COPY = {
    intro: `I can pass you to the RehabTask team, they'll follow up personally. Just your name and email is enough.`,
    accountIntro: `The team will reply to the email on your account. Tell us what you need help with.`,
    consent: "By sharing your details you agree to let the RehabTask team contact you about your request. We don't store this chat.",
    contextHelper: "Please keep this general, no medical or patient details.",
    submit: "Ask the team to contact me",
    expand: "Add a phone number",
    footerAction: "Contact the team",
    offer: "Want the team to get in touch?",
    offerAccept: "Yes, please",
    offerDecline: "No thanks",
    declinedAccount: `That's fine. You can reach the team any time at ${SUPPORT_EMAIL}, and they will have your account details.`,
    declinedGuest: `No problem. "Contact the team" at the bottom of this chat is there whenever you want it, or email ${SUPPORT_EMAIL}.`,
    offerAction: "Share your details",
};
