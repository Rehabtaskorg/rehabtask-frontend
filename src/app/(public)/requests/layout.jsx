const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rehabtask.com";

export const metadata = {
    title: "Open Therapy Requests — Home Health Job Opportunities",
    description: "Browse open therapy requests from home health agencies. Physical Therapy, Occupational Therapy, and Speech-Language Pathology opportunities. Set your own rates and schedule.",
    openGraph: {
        title: "Open Therapy Requests | RehabTask",
        description: "Home health agencies need licensed therapists. Browse open PT, OT, and SLP requests.",
    },
    alternates: {
        canonical: `${SITE_URL}/requests`,
    },
};

const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Open Therapy Requests", item: `${SITE_URL}/requests` },
    ],
};

export default function RequestsLayout({ children }) {
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
