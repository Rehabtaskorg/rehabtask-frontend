const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rehabtask.com";

export const metadata = {
    title: "Find Licensed Rehabilitation Therapists",
    description: "Browse verified Physical Therapists, Occupational Therapists, and Speech-Language Pathologists. Filter by specialty, location, and experience. Book home health therapy sessions.",
    openGraph: {
        title: "Find Licensed Rehabilitation Therapists | RehabTask",
        description: "Browse verified PTs, OTs, and SLPs. Filter by specialty, location, and experience.",
    },
    alternates: {
        canonical: `${SITE_URL}/therapists`,
    },
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Find Therapists", item: `${SITE_URL}/therapists` },
    ],
};

export default function TherapistsLayout({ children }) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            {children}
        </>
    );
}
