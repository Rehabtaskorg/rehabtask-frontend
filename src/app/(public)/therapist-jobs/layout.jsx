const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rehabtask.com";

export const metadata = {
    title: "Join RehabTask — Find Therapy Referrals & Grow Your Practice",
    description: "Browse home health therapy referrals from agencies nationwide. Physical Therapist, Occupational Therapist, and SLP jobs. Set your own rates, schedule, and grow your practice.",
    keywords: [
        "Home Health Therapist Jobs",
        "Physical Therapist Referrals",
        "Occupational Therapist Jobs",
        "Speech Therapist Jobs",
        "Home Health PT Platform",
        "Therapy Referral Marketplace",
        "Therapist Scheduling Software",
        "Therapist Marketplace",
    ],
    openGraph: {
        title: "Join RehabTask — Find Therapy Referrals & Grow Your Practice",
        description: "Browse home health therapy referrals from agencies nationwide. PT, OT, and SLP opportunities. Set your own rates and schedule.",
        url: `${SITE_URL}/therapist-jobs`,
        type: "website",
        images: [
            {
                url: `${SITE_URL}/images/og-therapist-jobs.png`,
                width: 1200,
                height: 630,
                alt: "RehabTask — Therapist Referral Marketplace",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Join RehabTask — Find Therapy Referrals & Grow Your Practice",
        description: "Browse home health therapy referrals from agencies nationwide. PT, OT, and SLP opportunities.",
        images: [`${SITE_URL}/images/og-therapist-jobs.png`],
    },
    alternates: {
        canonical: `${SITE_URL}/therapist-jobs`,
    },
};

const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Join RehabTask — Find Therapy Referrals & Grow Your Practice",
    description: "Browse home health therapy referrals from agencies nationwide. Physical Therapist, Occupational Therapist, and SLP opportunities.",
    url: `${SITE_URL}/therapist-jobs`,
    inLanguage: "en-US",
    publisher: {
        "@type": "Organization",
        name: "RehabTask",
        url: SITE_URL,
    },
};

const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Is RehabTask free to join?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes — creating a therapist account is completely free. You can browse open referrals, set up your profile, and submit offers at no cost. Premium subscription plans are available for therapists who want additional features and priority placement.",
            },
        },
        {
            "@type": "Question",
            name: "How do I receive referrals?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Once your profile is complete and your credentials are verified, you can browse open referrals from Home Health Agencies in your area. You'll receive notifications when new referrals matching your discipline and location are posted.",
            },
        },
        {
            "@type": "Question",
            name: "Can I choose which referrals to accept?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutely. You are in full control of which referrals you pursue. Browse available listings, review the case details, and submit offers only for the opportunities that fit your schedule, specialty, and preferred rate.",
            },
        },
        {
            "@type": "Question",
            name: "How do payments work?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Payments are processed securely through RehabTask using Stripe. Once a visit is confirmed and completed, your payout is initiated automatically. You can track your earnings in real time from your Earnings Dashboard.",
            },
        },
        {
            "@type": "Question",
            name: "How do I get paid?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Payouts are sent directly to your bank account via Stripe Connect. You'll need to complete a one-time Stripe onboarding to link your bank details. After that, payments are deposited automatically following each confirmed visit.",
            },
        },
        {
            "@type": "Question",
            name: "What subscription plans are available?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "RehabTask offers a free tier to get you started, plus paid plans with higher referral limits, priority visibility, and advanced scheduling tools. You can view and compare all plans from your account settings after signing up.",
            },
        },
        {
            "@type": "Question",
            name: "Do I need malpractice insurance?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. All therapists on RehabTask are required to carry active professional liability (malpractice) insurance. You will be asked to upload proof of coverage during the credential verification step of onboarding.",
            },
        },
        {
            "@type": "Question",
            name: "How do I become verified?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "After creating your account, you'll complete a credential verification process that includes uploading your active state license, proof of malpractice insurance, and any other required documentation. Most verifications are completed within 1–2 business days.",
            },
        },
        {
            "@type": "Question",
            name: "Which states are supported?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "RehabTask is currently available across the United States. Availability of referrals varies by state and discipline — browse the open referral marketplace to see listings in your area.",
            },
        },
    ],
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "For Therapists", item: `${SITE_URL}/therapist-jobs` },
    ],
};

export default function TherapistJobsLayout({ children }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {children}
        </>
    );
}