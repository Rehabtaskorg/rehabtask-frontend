import Link from "next/link";
import FadeIn from "@/components/ui/FadeIn";
import { MdHome, MdPeople, MdRecordVoiceOver, MdMedicalServices, MdArrowForward } from "react-icons/md";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const ICON_MAP = {
    "Physical Therapist": MdHome,
    "Occupational Therapist": MdPeople,
    "Speech-Language Pathologist": MdRecordVoiceOver,
};

const FALLBACK_THERAPISTS = [
    { id: "f1", primaryLicenseType: "Physical Therapist", yearsOfExperience: 8 },
    { id: "f2", primaryLicenseType: "Occupational Therapist", yearsOfExperience: 6 },
    { id: "f3", primaryLicenseType: "Speech-Language Pathologist", yearsOfExperience: 7 },
    { id: "f4", primaryLicenseType: "Physical Therapist", yearsOfExperience: 10 },
];

const FEATURED_IMAGE = {
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop",
};

async function fetchFeatured() {
    try {
        const res = await fetch(`${API_URL}/therapists/search?sortBy=rating&limit=6`, { next: { revalidate: 300 } });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data?.therapists || null;
    } catch {
        return null;
    }
}

export default async function FeaturedTherapists() {
    const data = await fetchFeatured();
    const therapists = data?.length > 0 ? data : FALLBACK_THERAPISTS;
    const cards = therapists.slice(0, 4);
    const featured = therapists[4] || null;
    const bottom = therapists[5] || null;

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-14">
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold" style={{ color: "#2EC4B6" }}>Available Therapists, right now</h2>
                    <p className="mt-3 text-gray-500">Browse verified professionals ready to take cases</p>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cards.map((t, i) => {
                            const Icon = ICON_MAP[t.primaryLicenseType] || MdMedicalServices;
                            return (
                                <FadeIn
                                    key={t.id}
                                    delay={i * 0.1}
                                    duration={0.4}
                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all group"
                                >
                                    <Icon className="text-2xl text-gray-400 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">Licensed {t.primaryLicenseType}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {t.yearsOfExperience} years experience
                                    </p>
                                    <Link
                                        href={`/therapists/${t.id}`}
                                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 group-hover:text-primary transition-colors"
                                    >
                                        View profile <MdArrowForward className="text-sm group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </FadeIn>
                            );
                        })}
                    </div>

                    <FadeIn
                        delay={0.3}
                        className="relative rounded-2xl overflow-hidden min-h-100 md:row-span-1"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${featured?.profilePhotoUrl || FEATURED_IMAGE.src})` }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            {featured && (
                                <>
                                    <p className="text-white/70 text-sm">Featured Therapist</p>
                                    <h3 className="text-2xl font-bold text-white mt-1">
                                        {featured.primaryLicenseType} &middot; {featured.yearsOfExperience} years experience
                                    </h3>
                                    <Link
                                        href={`/therapists/${featured.id}`}
                                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-colors"
                                    >
                                        View profile <MdArrowForward className="text-sm" />
                                    </Link>
                                </>
                            )}

                            {bottom && (
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <p className="text-white text-sm font-medium">Licensed {bottom.primaryLicenseType}</p>
                                    <p className="text-white/60 text-xs">
                                        {bottom.yearsOfExperience} years experience
                                        <MdArrowForward className="inline ml-1 text-xs" />
                                    </p>
                                </div>
                            )}
                        </div>
                    </FadeIn>
                </div>
            </div>
        </section>
    );
}
