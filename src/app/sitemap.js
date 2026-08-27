const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rehabtask.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchTherapistIds() {
    try {
        const res = await fetch(`${API_URL}/therapists/search?limit=50&sortBy=rating`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data?.therapists || [];
    } catch {
        return [];
    }
}

export default async function sitemap() {
    const therapists = await fetchTherapistIds();

    const staticPages = [
        { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
        { url: `${SITE_URL}/therapists`, changeFrequency: "daily", priority: 0.9 },
        { url: `${SITE_URL}/therapist-jobs`, changeFrequency: "weekly", priority: 0.9 },
        { url: `${SITE_URL}/requests`, changeFrequency: "daily", priority: 0.8 },
        { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    ];

    const therapistPages = therapists.map((t) => ({
        url: `${SITE_URL}/therapists/${t.id}`,
        changeFrequency: "weekly",
        priority: 0.7,
    }));

    return [...staticPages, ...therapistPages];
}
