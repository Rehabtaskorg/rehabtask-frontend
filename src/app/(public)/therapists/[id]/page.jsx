"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    MdStar, MdLocationOn, MdVerified, MdLock,
    MdCall, MdEmail, MdInfo, MdHealing, MdFitnessCenter,
    MdAccessibilityNew, MdSpa, MdArrowBack,
} from "react-icons/md";
import { useTherapistPublicProfile, useTherapistReviews } from "@/hooks/usePublic";
import AuthGateModal from "@/components/public/AuthGateModal";

const SPECIALIZATIONS = [
    { label: "Post-Surgical Recovery", icon: MdHealing },
    { label: "Sports Rehabilitation", icon: MdFitnessCenter },
    { label: "Joint Replacement", icon: MdAccessibilityNew },
    { label: "Geriatric Rehab", icon: MdHealing },
    { label: "Chronic Pain Management", icon: MdSpa },
    { label: "Fall Prevention", icon: MdAccessibilityNew },
];

const TIER_LABELS = { basic: "Basic", pro: "Verified Pro", elite: "Elite" };

function formatTime(t) {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const suffix = hour >= 12 ? "PM" : "AM";
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${display}:${m} ${suffix}`;
}

function ProfileSkeleton() {
    return (
        <div className="pt-16 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-gray-50 rounded-2xl p-8 flex gap-6">
                            <div className="w-[120px] h-[120px] rounded-full bg-gray-200 shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-7 w-64 bg-gray-200 rounded" />
                                <div className="h-5 w-48 bg-gray-200 rounded" />
                                <div className="h-4 w-32 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <div className="h-40 bg-gray-50 rounded-2xl" />
                        <div className="h-32 bg-gray-50 rounded-2xl" />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="h-64 bg-gray-50 rounded-2xl" />
                        <div className="h-48 bg-gray-50 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TherapistPublicProfilePage() {
    const params = useParams();
    const { data: profile, isLoading, error } = useTherapistPublicProfile(params.id);
    const { data: reviewsData } = useTherapistReviews(params.id);
    const [gateOpen, setGateOpen] = useState(false);
    const [gateTrigger, setGateTrigger] = useState("default");

    const handleAuthGate = (trigger) => {
        setGateTrigger(trigger);
        setGateOpen(true);
    };

    if (isLoading) return <ProfileSkeleton />;

    if (error || !profile) {
        return (
            <div className="pt-16 min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Therapist profile not found.</p>
                    <Link href="/therapists" className="text-[#137fec] font-semibold text-sm mt-2 inline-block hover:underline">
                        Back to search
                    </Link>
                </div>
            </div>
        );
    }

    const reviews = reviewsData?.reviews || [];
    const reviewTotal = reviewsData?.pagination?.total || profile.reviewCount || 0;
    const photoUrl = profile.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=137fec&color=fff&size=240`;
    const primaryArea = profile.workAreas?.[0];
    const rate = profile.ratePerVisit ? parseFloat(profile.ratePerVisit) : null;

    return (
        <>
            <div className="pt-16 min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link href="/therapists" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#137fec] transition-colors mb-6">
                        <MdArrowBack className="text-base" /> Back to search
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Profile Header */}
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 rounded-2xl p-8">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="relative shrink-0">
                                        <Image src={photoUrl} alt={profile.fullName} width={120} height={120} className="w-[120px] h-[120px] rounded-full object-cover border-4 border-white shadow-md" />
                                        <div className="absolute bottom-1 right-1 bg-emerald-500 p-1 rounded-full border-2 border-white">
                                            <MdVerified className="text-white text-xs" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{profile.fullName}</h1>
                                            <div className="flex items-center bg-white border border-gray-200 px-3 py-1 rounded-full">
                                                <MdStar className="text-amber-500 text-sm" />
                                                <span className="ml-1 text-sm font-bold text-gray-900">{profile.averageRating || "—"}</span>
                                                <span className="ml-1 text-xs text-gray-500">({reviewTotal} Reviews)</span>
                                            </div>
                                        </div>
                                        <p className="text-[#137fec] text-lg font-medium mb-4">
                                            {profile.primaryLicenseType}{profile.specialization ? ` · ${profile.specialization}` : ""}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-white border border-gray-200 text-gray-600 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg">
                                                {profile.primaryLicenseType}
                                            </span>
                                            {profile.yearsOfExperience && (
                                                <span className="bg-white border border-gray-200 text-gray-600 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg">
                                                    {profile.yearsOfExperience} Years Experience
                                                </span>
                                            )}
                                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                <MdVerified className="text-xs" /> Background Verified
                                            </span>
                                        </div>
                                        {primaryArea && (
                                            <div className="mt-4 flex items-center text-gray-500 gap-2">
                                                <MdLocationOn className="text-lg" />
                                                <span className="text-sm">{primaryArea.city}, {primaryArea.state} · {primaryArea.radiusMiles}-mile radius</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.section>

                            {/* About */}
                            {profile.professionalSummary && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">About</h2>
                                    <div className="bg-gray-50 rounded-2xl p-8">
                                        <p className="text-gray-600 leading-relaxed text-lg">{profile.professionalSummary}</p>
                                    </div>
                                </motion.section>
                            )}

                            {/* Specializations */}
                            <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                <h2 className="text-xl font-bold text-gray-900">Specializations</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {SPECIALIZATIONS.map((s) => (
                                        <div key={s.label} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center gap-3">
                                            <s.icon className="text-[#137fec] text-xl" />
                                            <span className="text-sm font-medium text-gray-700">{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* Availability */}
                            {profile.availability?.length > 0 && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">Availability</h2>
                                    <div className="bg-gray-50 rounded-2xl p-6 overflow-x-auto">
                                        <div className="flex gap-3 min-w-[500px]">
                                            {profile.availability.map((day) => (
                                                <div key={day.dayOfWeek || day.day} className="flex-1 space-y-2">
                                                    <div className="text-center pb-2 border-b border-gray-200">
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{(day.dayOfWeek || day.day || "").slice(0, 3)}</p>
                                                    </div>
                                                    {day.timeBlocks?.length > 0 ? (
                                                        day.timeBlocks.map((block, j) => (
                                                            <div key={j} className="bg-white border border-gray-100 text-[10px] text-center py-2 rounded-lg text-gray-700 font-medium">
                                                                {formatTime(block.startTime)} – {formatTime(block.endTime)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-[10px] text-center py-2 text-gray-400 italic">Unavailable</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {/* Work Areas */}
                            {profile.workAreas?.length > 0 && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">Service Area</h2>
                                    <div className="bg-gray-50 rounded-2xl p-8">
                                        <p className="text-sm text-gray-500 mb-3">Cities served</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5">
                                            {profile.workAreas.map((area) => (
                                                <div key={area.id || area.city} className="text-sm text-gray-700 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {area.city}, {area.state}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {/* Reviews */}
                            <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">Reviews ({reviewTotal})</h2>

                                {reviews.slice(0, 2).map((review) => {
                                    const initial = review.customer?.fullName?.charAt(0)?.toUpperCase() || "?";
                                    const displayName = review.customer?.fullName
                                        ? `${review.customer.fullName.split(" ")[0]} ${review.customer.fullName.split(" ").pop()?.charAt(0) || ""}.`
                                        : "Anonymous";
                                    return (
                                        <div key={review.id} className="bg-gray-50 p-6 rounded-2xl">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#137fec]/10 flex items-center justify-center font-bold text-[#137fec] text-sm">{initial}</div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{displayName}</p>
                                                        <p className="text-[10px] text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {Array.from({ length: review.rating }).map((_, j) => (
                                                        <MdStar key={j} className="text-amber-500 text-sm" />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && <p className="text-gray-600 text-sm italic leading-relaxed">&ldquo;{review.comment}&rdquo;</p>}
                                        </div>
                                    );
                                })}

                                {reviewTotal > 2 && (
                                    <div className="relative">
                                        <div className="bg-gray-50 p-6 rounded-2xl blur-sm select-none">
                                            <div className="flex gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-gray-200" /><div className="w-24 h-4 bg-gray-200 rounded" /></div>
                                            <div className="space-y-2"><div className="w-full h-3 bg-gray-200 rounded" /><div className="w-2/3 h-3 bg-gray-200 rounded" /></div>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center bg-white border border-gray-200 shadow-xl rounded-xl p-6">
                                                <MdLock className="text-[#137fec] text-2xl mx-auto mb-2" />
                                                <p className="font-bold text-gray-900 text-sm mb-3">Sign up to read all {reviewTotal} reviews</p>
                                                <button onClick={() => handleAuthGate("profile")} className="bg-[#137fec] text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-[#137fec]/90 transition-colors">
                                                    Create Free Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.section>
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-6">
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                                    <div className="mb-6 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Rate</p>
                                            <h3 className="text-3xl font-extrabold text-gray-900">
                                                {rate ? `$${rate}` : "—"}<span className="text-sm font-normal text-gray-500"> / visit</span>
                                            </h3>
                                        </div>
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">In-Home</span>
                                    </div>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleAuthGate("contact")}>
                                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#137fec]"><MdCall className="text-lg" /></div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Phone</p>
                                                <p className="text-sm font-medium text-gray-400 blur-[4px] select-none">(555) 123-4567</p>
                                            </div>
                                            <MdLock className="text-gray-400 text-sm" />
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleAuthGate("contact")}>
                                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#137fec]"><MdEmail className="text-lg" /></div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Email</p>
                                                <p className="text-sm font-medium text-gray-400 blur-[4px] select-none">therapist@clinic.com</p>
                                            </div>
                                            <MdLock className="text-gray-400 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <button onClick={() => handleAuthGate("offer")} className="w-full bg-[#137fec] text-white font-bold py-3.5 rounded-xl hover:bg-[#137fec]/90 transition-colors shadow-lg shadow-[#137fec]/20">Send Offer</button>
                                        <button onClick={() => handleAuthGate("message")} className="w-full bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">Message Therapist</button>
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white rounded-2xl p-6 border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2"><MdInfo className="text-[#137fec] text-lg" /> Quick Facts</h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: "License Type", value: profile.primaryLicenseType },
                                            { label: "Experience", value: profile.yearsOfExperience ? `${profile.yearsOfExperience} Years` : "—" },
                                            { label: "Rate", value: rate ? `$${rate}/visit` : "—" },
                                            { label: "Service Area", value: primaryArea ? `${primaryArea.city} (${primaryArea.radiusMiles}mi)` : "—" },
                                        ].map((fact, i, arr) => (
                                            <div key={fact.label} className={`flex justify-between items-center py-2 ${i < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                                                <span className="text-xs text-gray-500">{fact.label}</span>
                                                <span className="text-xs font-bold text-gray-900">{fact.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AuthGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} trigger={gateTrigger} redirectPath={`/therapists/${params.id}`} />
        </>
    );
}
