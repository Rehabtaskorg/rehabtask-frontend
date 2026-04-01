const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rehabtask.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchTherapist(id) {
    try {
        const res = await fetch(`${API_URL}/therapists/${id}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data || null;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    const therapist = await fetchTherapist(id);

    if (!therapist) {
        return {
            title: "Therapist Profile",
            description: "View this therapist's profile on RehabTask.",
        };
    }

    const city = therapist.workAreas?.[0]?.city;
    const state = therapist.workAreas?.[0]?.state;
    const locationStr = city && state ? ` in ${city}, ${state}` : "";
    const rateStr = therapist.ratePerVisit ? ` $${parseFloat(therapist.ratePerVisit)}/visit.` : "";
    const expStr = therapist.yearsOfExperience ? `${therapist.yearsOfExperience}+ years experience.` : "";
    const ratingStr = therapist.averageRating ? `${therapist.averageRating} ★ (${therapist.reviewCount || 0} reviews).` : "";

    const title = `${therapist.primaryLicenseType || "Therapist"}${locationStr}`;
    const description = `Licensed ${therapist.primaryLicenseType || "Therapist"}${locationStr}. ${expStr} ${ratingStr}${rateStr} Book home health rehabilitation sessions on RehabTask.`.trim();

    return {
        title,
        description,
        openGraph: {
            title: `${title} | RehabTask`,
            description,
            type: "profile",
            url: `${SITE_URL}/therapists/${id}`,
            ...(therapist.profilePhotoUrl && {
                images: [{ url: therapist.profilePhotoUrl, width: 400, height: 400, alt: `${therapist.primaryLicenseType} profile` }],
            }),
        },
        twitter: {
            card: "summary",
            title: `${title} | RehabTask`,
            description,
        },
        alternates: {
            canonical: `${SITE_URL}/therapists/${id}`,
        },
    };
}

function buildJsonLd(therapist) {
    if (!therapist) return null;

    const city = therapist.workAreas?.[0]?.city;
    const state = therapist.workAreas?.[0]?.state;
    const rate = therapist.ratePerVisit ? parseFloat(therapist.ratePerVisit) : null;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "MedicalBusiness",
        name: therapist.primaryLicenseType || "Rehabilitation Therapist",
        url: `${SITE_URL}/therapists/${therapist.id}`,
        description: therapist.specialization
            ? `Licensed ${therapist.primaryLicenseType} specializing in ${therapist.specialization}`
            : `Licensed ${therapist.primaryLicenseType} providing home health rehabilitation services`,
        medicalSpecialty: therapist.specialization || therapist.primaryLicenseType,
        ...(therapist.profilePhotoUrl && { image: therapist.profilePhotoUrl }),
        ...(city && state && {
            address: {
                "@type": "PostalAddress",
                addressLocality: city,
                addressRegion: state,
                addressCountry: "US",
            },
            areaServed: therapist.workAreas.map((wa) => ({
                "@type": "City",
                name: `${wa.city}, ${wa.state}`,
            })),
        }),
        ...(rate && { priceRange: `$${rate}/visit` }),
        ...(therapist.averageRating && therapist.reviewCount > 0 && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: therapist.averageRating,
                reviewCount: therapist.reviewCount,
                bestRating: 5,
                worstRating: 1,
            },
        }),
    };

    return jsonLd;
}

export default async function TherapistProfileLayout({ children, params }) {
    const { id } = await params;
    const therapist = await fetchTherapist(id);
    const jsonLd = buildJsonLd(therapist);

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </>
    );
}
