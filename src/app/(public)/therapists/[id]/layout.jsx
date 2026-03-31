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

export default function TherapistProfileLayout({ children }) {
    return children;
}
