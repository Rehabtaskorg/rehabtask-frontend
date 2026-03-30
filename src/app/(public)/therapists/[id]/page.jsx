"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    MdStar, MdLocationOn, MdVerified, MdWorkHistory, MdLock,
    MdCall, MdEmail, MdInfo, MdHealing, MdFitnessCenter,
    MdAccessibilityNew, MdSpa, MdArrowBack,
} from "react-icons/md";
import AuthGateModal from "@/components/public/AuthGateModal";

// Sample data matching our TherapistProfile model fields
const SAMPLE_PROFILE = {
    id: "1",
    fullName: "Dr. Sarah Jenkins, DPT",
    primaryLicenseType: "Physical Therapist",
    specialization: "Orthopedic Rehabilitation",
    yearsOfExperience: 8,
    profilePhotoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    ratePerVisit: 125,
    professionalSummary: "Dedicated to restoring movement and quality of life through evidence-based clinical practice. I specialize in complex post-surgical rehabilitation and sports injury recovery, utilizing a combination of manual therapy techniques and customized progressive exercise programs designed for long-term functional independence.",
    averageRating: 4.9,
    reviewCount: 124,
    planTier: "pro",
    workAreas: [
        { city: "Los Angeles", state: "CA", radiusMiles: 15 },
        { city: "Santa Monica", state: "CA", radiusMiles: 10 },
        { city: "Beverly Hills", state: "CA", radiusMiles: 10 },
        { city: "Pasadena", state: "CA", radiusMiles: 12 },
        { city: "Burbank", state: "CA", radiusMiles: 10 },
        { city: "Glendale", state: "CA", radiusMiles: 10 },
    ],
    availability: [
        { day: "Monday", enabled: true, timeBlocks: [{ startTime: "08:00", endTime: "12:00" }, { startTime: "13:00", endTime: "17:00" }] },
        { day: "Tuesday", enabled: true, timeBlocks: [{ startTime: "09:00", endTime: "15:00" }] },
        { day: "Wednesday", enabled: true, timeBlocks: [{ startTime: "08:00", endTime: "12:00" }] },
        { day: "Thursday", enabled: true, timeBlocks: [{ startTime: "10:00", endTime: "18:00" }] },
        { day: "Friday", enabled: true, timeBlocks: [{ startTime: "08:00", endTime: "14:00" }] },
        { day: "Saturday", enabled: false, timeBlocks: [] },
        { day: "Sunday", enabled: false, timeBlocks: [] },
    ],
    reviews: [
        { id: "r1", rating: 5, initials: "JD", name: "John D.", context: "Post-Surgical Knee Rehab", text: "Dr. Jenkins was instrumental in my recovery after ACL surgery. She is professional, patient, and pushed me just the right amount to reach my goals ahead of schedule." },
        { id: "r2", rating: 5, initials: "SL", name: "Sarah L.", context: "Chronic Shoulder Pain", text: "I've seen several therapists for my shoulder but Sarah's approach was the only one that actually stuck. Her manual therapy skills are top-notch." },
    ],
};

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
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const suffix = hour >= 12 ? "PM" : "AM";
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${display}:${m} ${suffix}`;
}

export default function TherapistPublicProfilePage() {
    const params = useParams();
    const [gateOpen, setGateOpen] = useState(false);
    const [gateTrigger, setGateTrigger] = useState("default");

    const profile = SAMPLE_PROFILE;

    const handleAuthGate = (trigger) => {
        setGateTrigger(trigger);
        setGateOpen(true);
    };

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
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-gray-50 rounded-2xl p-8"
                            >
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="relative shrink-0">
                                        <Image
                                            src={profile.profilePhotoUrl}
                                            alt={profile.fullName}
                                            width={120}
                                            height={120}
                                            className="w-[120px] h-[120px] rounded-full object-cover border-4 border-white shadow-md"
                                        />
                                        <div className="absolute bottom-1 right-1 bg-emerald-500 p-1 rounded-full border-2 border-white">
                                            <MdVerified className="text-white text-xs" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{profile.fullName}</h1>
                                            <div className="flex items-center bg-white border border-gray-200 px-3 py-1 rounded-full">
                                                <MdStar className="text-amber-500 text-sm" />
                                                <span className="ml-1 text-sm font-bold text-gray-900">{profile.averageRating}</span>
                                                <span className="ml-1 text-xs text-gray-500">({profile.reviewCount} Reviews)</span>
                                            </div>
                                        </div>
                                        <p className="text-[#137fec] text-lg font-medium mb-4">
                                            {profile.primaryLicenseType} &middot; {profile.specialization}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-white border border-gray-200 text-gray-600 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg">
                                                Licensed {profile.primaryLicenseType.split(" ").map(w => w[0]).join("")}
                                            </span>
                                            <span className="bg-white border border-gray-200 text-gray-600 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg">
                                                {profile.yearsOfExperience} Years Experience
                                            </span>
                                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                <MdVerified className="text-xs" /> Background Verified
                                            </span>
                                        </div>
                                        <div className="mt-4 flex items-center text-gray-500 gap-2">
                                            <MdLocationOn className="text-lg" />
                                            <span className="text-sm">
                                                {profile.workAreas[0]?.city}, {profile.workAreas[0]?.state} &middot; {profile.workAreas[0]?.radiusMiles}-mile radius
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* About */}
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="space-y-3"
                            >
                                <h2 className="text-xl font-bold text-gray-900">About</h2>
                                <div className="bg-gray-50 rounded-2xl p-8">
                                    <p className="text-gray-600 leading-relaxed text-lg">{profile.professionalSummary}</p>
                                </div>
                            </motion.section>

                            {/* Specializations */}
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="space-y-3"
                            >
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
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="space-y-3"
                            >
                                <h2 className="text-xl font-bold text-gray-900">Availability</h2>
                                <div className="bg-gray-50 rounded-2xl p-6 overflow-x-auto">
                                    <div className="flex gap-3 min-w-[500px]">
                                        {profile.availability.map((day) => (
                                            <div key={day.day} className="flex-1 space-y-2">
                                                <div className="text-center pb-2 border-b border-gray-200">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{day.day.slice(0, 3)}</p>
                                                </div>
                                                {day.enabled && day.timeBlocks.length > 0 ? (
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

                            {/* Work Areas */}
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="space-y-3"
                            >
                                <h2 className="text-xl font-bold text-gray-900">Service Area</h2>
                                <div className="bg-gray-50 rounded-2xl p-8">
                                    <p className="text-sm text-gray-500 mb-3">Cities served</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5">
                                        {profile.workAreas.map((area) => (
                                            <div key={area.city} className="text-sm text-gray-700 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                {area.city}, {area.state}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>

                            {/* Reviews */}
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="space-y-4"
                            >
                                <h2 className="text-xl font-bold text-gray-900">Reviews ({profile.reviewCount})</h2>

                                {profile.reviews.map((review) => (
                                    <div key={review.id} className="bg-gray-50 p-6 rounded-2xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#137fec]/10 flex items-center justify-center font-bold text-[#137fec] text-sm">
                                                    {review.initials}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{review.name}</p>
                                                    <p className="text-[10px] text-gray-500">{review.context}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: review.rating }).map((_, j) => (
                                                    <MdStar key={j} className="text-amber-500 text-sm" />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm italic leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                                    </div>
                                ))}

                                {/* Blurred review gate */}
                                <div className="relative">
                                    <div className="bg-gray-50 p-6 rounded-2xl blur-sm select-none">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                                <div className="w-24 h-4 bg-gray-200 rounded" />
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-4 h-4 bg-gray-200 rounded" />
                                                <div className="w-4 h-4 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-full h-3 bg-gray-200 rounded" />
                                            <div className="w-2/3 h-3 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center bg-white border border-gray-200 shadow-xl rounded-xl p-6">
                                            <MdLock className="text-[#137fec] text-2xl mx-auto mb-2" />
                                            <p className="font-bold text-gray-900 text-sm mb-3">Sign up to read all {profile.reviewCount} reviews</p>
                                            <button
                                                onClick={() => handleAuthGate("profile")}
                                                className="bg-[#137fec] text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-[#137fec]/90 transition-colors"
                                            >
                                                Create Free Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        </div>

                        {/* Right Column — Sticky Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-24 space-y-6">
                                {/* Contact Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                                >
                                    <div className="mb-6 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Rate</p>
                                            <h3 className="text-3xl font-extrabold text-gray-900">
                                                ${profile.ratePerVisit}
                                                <span className="text-sm font-normal text-gray-500"> / visit</span>
                                            </h3>
                                        </div>
                                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">In-Home</span>
                                    </div>

                                    {/* Blurred contact fields */}
                                    <div className="space-y-3 mb-6">
                                        <div
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleAuthGate("contact")}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#137fec]">
                                                <MdCall className="text-lg" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Phone</p>
                                                <p className="text-sm font-medium text-gray-400 blur-[4px] select-none">(555) 123-4567</p>
                                            </div>
                                            <MdLock className="text-gray-400 text-sm" />
                                        </div>
                                        <div
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleAuthGate("contact")}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[#137fec]">
                                                <MdEmail className="text-lg" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Email</p>
                                                <p className="text-sm font-medium text-gray-400 blur-[4px] select-none">sarah@clinic.com</p>
                                            </div>
                                            <MdLock className="text-gray-400 text-sm" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleAuthGate("offer")}
                                            className="w-full bg-[#137fec] text-white font-bold py-3.5 rounded-xl hover:bg-[#137fec]/90 transition-colors shadow-lg shadow-[#137fec]/20"
                                        >
                                            Send Offer
                                        </button>
                                        <button
                                            onClick={() => handleAuthGate("message")}
                                            className="w-full bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                                        >
                                            Message Therapist
                                        </button>
                                    </div>
                                </motion.div>

                                {/* Quick Facts */}
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="bg-white rounded-2xl p-6 border border-gray-200"
                                >
                                    <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                                        <MdInfo className="text-[#137fec] text-lg" />
                                        Quick Facts
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: "License Type", value: profile.primaryLicenseType },
                                            { label: "Experience", value: `${profile.yearsOfExperience} Years` },
                                            { label: "Rate", value: `$${profile.ratePerVisit}/visit` },
                                            { label: "Service Area", value: `${profile.workAreas[0]?.city} (${profile.workAreas[0]?.radiusMiles}mi)` },
                                            { label: "Plan", value: TIER_LABELS[profile.planTier] || "Basic", badge: true },
                                        ].map((fact, i) => (
                                            <div key={fact.label} className={`flex justify-between items-center py-2 ${i < 4 ? "border-b border-gray-100" : ""}`}>
                                                <span className="text-xs text-gray-500">{fact.label}</span>
                                                <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                                                    {fact.value}
                                                    {fact.badge && <MdVerified className="text-emerald-500 text-xs" />}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AuthGateModal
                isOpen={gateOpen}
                onClose={() => setGateOpen(false)}
                trigger={gateTrigger}
                redirectPath={`/therapists/${params.id}`}
            />
        </>
    );
}
