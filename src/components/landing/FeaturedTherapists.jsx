"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MdHome, MdPeople, MdRecordVoiceOver, MdMedicalServices, MdArrowForward } from "react-icons/md";
import { useFeaturedTherapists } from "@/hooks/usePublic";

const ICON_MAP = {
    "Physical Therapist": MdHome,
    "Occupational Therapist": MdPeople,
    "Speech-Language Pathologist": MdRecordVoiceOver,
};

const FALLBACK_THERAPISTS = [
    { id: "f1", fullName: "Sarah Mitchell", primaryLicenseType: "Physical Therapist", yearsOfExperience: 8 },
    { id: "f2", fullName: "James Chen", primaryLicenseType: "Occupational Therapist", yearsOfExperience: 6 },
    { id: "f3", fullName: "Emily Rodriguez", primaryLicenseType: "Speech-Language Pathologist", yearsOfExperience: 7 },
    { id: "f4", fullName: "Michael Thompson", primaryLicenseType: "Physical Therapist", yearsOfExperience: 10 },
];

const FEATURED_IMAGE = {
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=800&fit=crop",
};

export default function FeaturedTherapists() {
    const { data } = useFeaturedTherapists();
    const therapists = data?.therapists?.length > 0 ? data.therapists : FALLBACK_THERAPISTS;
    const cards = therapists.slice(0, 4);
    const featured = therapists[4] || null;
    const bottom = therapists[5] || null;
    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">Featured</p>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">Top rated therapists</h2>
                    <p className="mt-3 text-gray-500">Work with the most trusted rehabilitation professionals</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left column: 2x2 grid of therapist cards */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cards.map((t, i) => {
                            const Icon = ICON_MAP[t.primaryLicenseType] || MdMedicalServices;
                            return (
                                <motion.div
                                    key={t.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all group"
                                >
                                    <Icon className="text-2xl text-gray-400 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">{t.fullName}</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        {t.primaryLicenseType} &middot; {t.yearsOfExperience} years experience
                                    </p>
                                    <Link
                                        href={`/therapists/${t.id}`}
                                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 group-hover:text-primary transition-colors"
                                    >
                                        View profile <MdArrowForward className="text-sm group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Right column: featured image card */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
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
                                    <p className="text-white/70 text-sm">{featured.fullName}</p>
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
                                    <p className="text-white text-sm font-medium">{bottom.fullName}</p>
                                    <p className="text-white/60 text-xs">
                                        {bottom.primaryLicenseType} &middot; {bottom.yearsOfExperience} years experience
                                        <MdArrowForward className="inline ml-1 text-xs" />
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
