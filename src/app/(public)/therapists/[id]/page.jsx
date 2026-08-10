"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    MdStar, MdLocationOn, MdVerified, MdLock,
    MdCall, MdEmail, MdInfo, MdArrowBack, MdBarChart, MdPhone,
} from "react-icons/md";
import { useTherapistPublicProfile, useTherapistReviews } from "@/hooks/usePublic";
import { useAppRole } from "@/hooks/useAppRole";
import { LICENSE_TYPE_TO_DISCIPLINE } from "@/lib/constants";
import AuthGateModal from "@/components/public/AuthGateModal";
import UserAvatar from "@/components/ui/UserAvatar";
import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { useAnalytics } from "@/hooks/useAnalytics";

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
        <>
            <Navbar />
            <div className="pt-14 min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-gray-50 rounded-2xl p-8 flex gap-6">
                            <div className="w-30 h-30 rounded-full bg-gray-200 shrink-0" />
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
        </>
    );
}

function TherapistPublicProfileContent() {
    const params = useParams();
    const { data: profile, isLoading, error } = useTherapistPublicProfile(params.id);
    const { data: reviewsData } = useTherapistReviews(params.id, 1);
    const [gateOpen, setGateOpen] = useState(false);
    const [gateTrigger, setGateTrigger] = useState("default");
    const [gateEntityId, setGateEntityId] = useState(null);
    const userRole = useAppRole();
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        if (!profile) return;
        trackEvent("therapist_profile_viewed", {
            plan_tier: profile.planTier ?? null,
            license_type: profile.primaryLicenseType ?? null,
        });
    }, [profile, trackEvent]);

    const handleAuthGate = (trigger) => {
        setGateTrigger(trigger);
        setGateEntityId(trigger === "message" ? profile?.userId : profile?.id);
        setGateOpen(true);
    };

    if (isLoading) return <ProfileSkeleton />;

    if (error || !profile) {
        return (
            <>
                <Navbar />
                <div className="pt-14 min-h-screen bg-white flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500">Therapist profile not found.</p>
                        <Link href="/therapists" className="text-primary font-semibold text-sm mt-2 inline-block hover:underline">
                            Back to search
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const reviewTotal = profile.reviewCount || 0;
    const primaryArea = profile.workAreas?.[0];
    const rate = profile.ratePerVisit ? parseFloat(profile.ratePerVisit) : null;
    const hasAdditionalRates = profile.evaluationRate != null || profile.travelFee != null;

    return (
        <>
            <Navbar />
            <div className="pt-14 min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link href="/therapists" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary transition-colors mb-6">
                        <MdArrowBack className="text-base" /> Back to search
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column */}
                        <div className="lg:col-span-8 space-y-10">
                            {/* Profile Header */}
                            <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 rounded-2xl p-8">
                                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="relative shrink-0">
                                        <UserAvatar
                                            name={profile.primaryLicenseType || "Therapist"}
                                            photoUrl={profile.profilePhotoUrl}
                                            size="3xl"
                                            className="border-4 border-white shadow-md"
                                        />
                                        <div className="absolute bottom-1 right-1 bg-emerald-500 p-1 rounded-full border-2 border-white">
                                            <MdVerified className="text-white text-xs" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{profile.fullName}</h1>
                                            <div className="flex items-center bg-white border border-gray-200 px-3 py-1 rounded-full">
                                                <MdStar className="text-amber-500 text-sm" />
                                                <span className="ml-1 text-sm font-bold text-gray-900">{profile.averageRating || "—"}</span>
                                                <span className="ml-1 text-xs text-gray-500">({reviewTotal} Reviews)</span>
                                            </div>
                                        </div>
                                        <p className="text-primary text-lg font-medium mb-4">
                                            {LICENSE_TYPE_TO_DISCIPLINE[profile.primaryLicenseType] ?? profile.primaryLicenseType}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.primaryLicenseType && (
                                                <span className="bg-white border border-gray-200 text-gray-600 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg">
                                                    {LICENSE_TYPE_TO_DISCIPLINE[profile.primaryLicenseType] ?? profile.primaryLicenseType}
                                                </span>
                                            )}
                                            {profile.yearsOfExperience && (
                                                <span className="bg-white border border-gray-200 text-gray-600 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg">
                                                    {profile.yearsOfExperience} Years Experience
                                                </span>
                                            )}
                                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                <MdVerified className="text-xs" /> Background Verified
                                            </span>
                                            {profile.hipaaAttested && (
                                                <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <MdVerified className="text-xs" /> HIPAA Certified
                                                </span>
                                            )}
                                            {profile.licenseVerified && (
                                                <span className="bg-sky-50 border border-sky-200 text-sky-700 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <MdVerified className="text-xs" /> License Verified
                                                </span>
                                            )}
                                            {profile.insuranceVerified && (
                                                <span className="bg-purple-50 border border-purple-200 text-purple-700 text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <MdVerified className="text-xs" /> Insured
                                                </span>
                                            )}
                                        </div>
                                        {primaryArea && (
                                            <div className="mt-4 flex items-center text-gray-500 gap-2">
                                                <MdLocationOn className="text-lg" />
                                                <span className="text-sm">{primaryArea.city}, {primaryArea.state}</span>
                                            </div>
                                        )}
                                        {profile.npiNumber && (
                                            <p className="mt-2 text-sm text-gray-500">NPI: {profile.npiNumber}</p>
                                        )}
                                        {profile.phone && (
                                            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                                                <MdPhone className="text-base" />
                                                {profile.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.section>

                            {/* About — public */}
                            {profile.professionalSummary && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">About</h2>
                                    <div className="bg-gray-50 rounded-2xl p-8">
                                        <p className="text-gray-600 leading-relaxed text-lg">{profile.professionalSummary}</p>
                                    </div>
                                </motion.section>
                            )}

                            {/* Clinical Skills */}
                            {(profile.specialties?.length > 0 || profile.languages?.length > 0 || profile.certifications?.length > 0) && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">Clinical Skills</h2>
                                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                        {profile.specialties?.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Specialties</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.specialties.map((s) => (
                                                        <span key={s} className="bg-primary/10 text-primary border border-primary/20 text-sm font-semibold px-3 py-1.5 rounded-lg">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {profile.languages?.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Languages</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.languages.map((l) => (
                                                        <span key={l} className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-lg">{l}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {profile.certifications?.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Certifications</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.certifications.map((c) => (
                                                        <span key={c} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-lg">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}

                            {/* Clinical Background */}
                            {(profile.pastSettings?.length > 0 || profile.populationExperience?.length > 0 || profile.yearsInHomeHealth != null) && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">Clinical Background</h2>
                                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                        {profile.pastSettings?.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Past Settings</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.pastSettings.map((s) => (
                                                        <span key={s} className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-lg">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {profile.populationExperience?.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Patient Population</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.populationExperience.map((p) => (
                                                        <span key={p} className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-3 py-1.5 rounded-lg">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {profile.yearsInHomeHealth != null && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Years in Home Health</p>
                                                <p className="text-sm font-semibold text-gray-800">
                                                    {profile.yearsInHomeHealth} {profile.yearsInHomeHealth === 1 ? "year" : "years"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}

                            {/* Additional Rates */}
                            {hasAdditionalRates && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">Additional Rates</h2>
                                    <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {profile.evaluationRate != null && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Evaluation Rate</p>
                                                <p className="text-lg font-extrabold text-gray-900">${parseFloat(profile.evaluationRate).toFixed(2)}</p>
                                            </div>
                                        )}
                                        {profile.travelFee != null && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Travel Fee</p>
                                                <p className="text-lg font-extrabold text-gray-900">${parseFloat(profile.travelFee).toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}

                            {/* Performance */}
                            {(profile.stats?.completedVisits > 0 || profile.stats?.reviewCount > 0) && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <MdBarChart className="text-primary" /> Performance
                                    </h2>
                                    <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <p className="text-3xl font-extrabold text-gray-900">{profile.stats.completedVisits}</p>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">Completed Visits</p>
                                        </div>
                                        {profile.stats.reviewCount > 0 && (
                                            <div className="text-center">
                                                <p className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-1">
                                                    <MdStar className="text-amber-400 text-2xl" />{profile.stats.averageRating}
                                                </p>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                                                    Avg Rating ({profile.stats.reviewCount} {profile.stats.reviewCount === 1 ? "review" : "reviews"})
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            )}

                            {/* Availability */}
                            {profile.availability?.length > 0 && (
                                <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-3">
                                    <h2 className="text-xl font-bold text-gray-900">Availability</h2>
                                    <div className="bg-gray-50 rounded-2xl p-6 overflow-x-auto">
                                        <div className="flex gap-3 min-w-125">
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

                            {/* Reviews — first 3 public, rest gated */}
                            <motion.section initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">Reviews ({reviewTotal})</h2>

                                {reviewTotal === 0 ? (
                                    <div className="bg-gray-50 rounded-2xl p-8 text-center">
                                        <p className="text-gray-500 text-sm">No reviews yet.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {(reviewsData?.reviews || []).slice(0, 3).map((review) => (
                                                <div key={review.id} className="bg-gray-50 p-6 rounded-2xl">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                                {review.customer?.fullName?.charAt(0)?.toUpperCase() || "?"}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">{review.customer?.fullName || "Agency"}</p>
                                                                <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, j) => (
                                                                <MdStar key={j} className={`text-sm ${j < review.rating ? "text-amber-400" : "text-gray-300"}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {reviewTotal > 3 && (
                                            <div className="text-center bg-gray-50 border border-gray-200 rounded-2xl p-6">
                                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                                    {reviewTotal - 3} more review{reviewTotal - 3 !== 1 ? "s" : ""}
                                                </p>
                                                <p className="text-xs text-gray-500 mb-3">Sign up to read all {reviewTotal} reviews</p>
                                                <button
                                                    onClick={() => handleAuthGate("profile")}
                                                    className="bg-primary text-white text-xs font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    Create Free Account
                                                </button>
                                            </div>
                                        )}
                                    </>
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
                                    {profile.attemptedVisitRate != null && (
                                        parseFloat(profile.attemptedVisitRate) > 0 ? (
                                            <p className="text-xs text-gray-500 mb-4">
                                                Attempted visit fee: <span className="font-semibold text-gray-700">${parseFloat(profile.attemptedVisitRate).toFixed(2)}</span>
                                                <span className="text-gray-400 ml-1">(if session cannot proceed)</span>
                                            </p>
                                        ) : (
                                            <p className="text-xs text-emerald-600 font-medium mb-4">
                                                No charge for missed visits
                                            </p>
                                        )
                                    )}
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleAuthGate("contact")}>
                                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-primary"><MdCall className="text-lg" /></div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Phone</p>
                                                <p className="text-sm font-medium text-gray-400 blur-xs select-none">(555) 123-4567</p>
                                            </div>
                                            <MdLock className="text-gray-400 text-sm" />
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleAuthGate("contact")}>
                                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-primary"><MdEmail className="text-lg" /></div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Email</p>
                                                <p className="text-sm font-medium text-gray-400 blur-xs select-none">therapist@clinic.com</p>
                                            </div>
                                            <MdLock className="text-gray-400 text-sm" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <button onClick={() => handleAuthGate("request")} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Send Request</button>
                                        <button onClick={() => handleAuthGate("message")} className="w-full bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">Message Therapist</button>
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white rounded-2xl p-6 border border-gray-200">
                                    <h4 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2"><MdInfo className="text-primary text-lg" /> Quick Facts</h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: "Discipline type", value: profile.primaryLicenseType },
                                            { label: "Experience", value: profile.yearsOfExperience ? `${profile.yearsOfExperience} yrs` : "—" },
                                            ...(profile.yearsInHomeHealth != null ? [{ label: "Home Health Exp.", value: `${profile.yearsInHomeHealth} yrs` }] : []),
                                            { label: "Rate", value: rate ? `$${rate}/visit` : "—" },
                                            ...(profile.evaluationRate != null ? [{ label: "Evaluation Rate", value: `$${parseFloat(profile.evaluationRate).toFixed(2)}` }] : []),
                                            ...(profile.travelFee != null ? [{ label: "Travel Fee", value: `$${parseFloat(profile.travelFee).toFixed(2)}` }] : []),
                                            ...(profile.attemptedVisitRate != null ? [{
                                                label: "Attempted Visit",
                                                value: parseFloat(profile.attemptedVisitRate) > 0
                                                    ? `$${parseFloat(profile.attemptedVisitRate).toFixed(2)}`
                                                    : "No charge",
                                            }] : []),
                                            { label: "Service Area", value: primaryArea ? `${primaryArea.city}, ${primaryArea.state}` : "—" },
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

            <AuthGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} trigger={gateTrigger} entityId={gateEntityId} userRole={userRole} />
            <Footer />
        </>
    );
}

export default function TherapistPublicProfilePage() {
    return (
        <Suspense fallback={<ProfileSkeleton />}>
            <TherapistPublicProfileContent />
        </Suspense>
    );
}
