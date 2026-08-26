"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MdChevronRight, MdVerified, MdWork, MdPhone, MdEmail, MdChat, MdStar, MdChevronLeft, MdRefresh, MdArrowBack, MdAttachMoney, MdBarChart, MdLock,
} from "react-icons/md";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useTherapistPublicProfile, useTherapistReviews } from "@/hooks/useTherapistSearch";
import UserAvatar from "@/components/ui/UserAvatar";
import StarRating from "@/components/therapist/StarRating";
import ServiceAreasCard from "@/components/therapist/ServiceAreasCard";
import AvailabilityCard from "@/components/therapist/AvailabilityCard";
import ReviewCard from "@/components/therapist/ReviewCard";
import ReviewForm from "@/components/therapist/ReviewForm";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useMessageGuard } from "@/hooks/useMessageGuard";
import { MessageGateModal } from "@/components/ui/MessageGateModal";
import { LICENSE_TYPE_TO_DISCIPLINE } from "@/lib/constants";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function TherapistProfilePage() {
    usePageTitle("Therapist Profile");
    const params = useParams();
    const router = useRouter();
    const therapistId = params.id;

    const { therapist, loading, error, refetch } = useTherapistPublicProfile(therapistId);
    const [reviewPage, setReviewPage] = useState(1);

    const { reviews, pagination: reviewPagination, loading: reviewsLoading } = useTherapistReviews(therapistId, reviewPage);

    const [showReviewForm, setShowReviewForm] = useState(false);

    const { guardedHandleMessage, isGateOpen, closeGate, gateProps } = useMessageGuard();
    const handleMessage = () => { if (therapist?.userId) guardedHandleMessage(therapist.userId); };

    const handleReviewSuccess = () => {
        setShowReviewForm(false);
        refetch();
    };

    // ─── Loading ────
    if (loading) {
        return (
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-6 w-48 bg-slate-200  rounded" />
                    <div className="h-48 bg-card-light  border border-border-light  rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-64 bg-card-light  border border-border-light  rounded-xl" />
                        <div className="h-64 bg-card-light  border border-border-light  rounded-xl" />
                    </div>
                    <div className="h-40 bg-card-light  border border-border-light  rounded-xl" />
                </div>
            </div>
        );
    }

    // ─── Error ────
    if (error || !therapist) {
        return (
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
                <button
                    onClick={() => router.push("/customer/find-therapists")}
                    className="flex items-center gap-1 text-sm text-text-muted  hover:text-primary transition-colors mb-6"
                >
                    <MdArrowBack className="text-base" /> Back to Search
                </button>
                <div className="bg-red-50  border border-red-200  rounded-xl p-6 text-center">
                    <p className="text-red-700  font-semibold">Therapist not found</p>
                    <button onClick={refetch} className="text-primary hover:underline text-sm font-bold mt-2 flex items-center gap-1 mx-auto">
                        <MdRefresh className="text-base" /> Retry
                    </button>
                </div>
            </div>
        );
    }

    const reviewableBookings = therapist.reviewableBookings || [];
    const canReview = reviewableBookings.length > 0;
    const reviewTotalPages = reviewPagination?.totalPages || 1;

    return (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <MessageGateModal isOpen={isGateOpen} onClose={closeGate} {...gateProps} />
            <div className="p-4 md:p-6 max-w-5xl mx-auto pb-24 lg:pb-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm mb-6">
                    <button
                        onClick={() => router.push("/customer/find-therapists")}
                        className="text-primary hover:underline font-medium"
                    >
                        Find Therapists
                    </button>
                    <MdChevronRight className="text-text-muted " />
                    <span className="text-text-main  font-medium truncate">
                        {therapist.fullName}
                    </span>
                </nav>

                {/* ── Profile Header Card ── */}
                <div className="bg-card-light  border border-border-light  rounded-xl p-6 sm:p-8 shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <UserAvatar
                                name={therapist.fullName}
                                photoUrl={therapist.profilePhotoUrl}
                                size="xl"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            {/* Name + badges */}
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                <h1 className="text-2xl font-bold text-text-main ">
                                    {therapist.fullName}
                                </h1>
                                {therapist.primaryLicenseType && (
                                    <span className="bg-sky-100  text-sky-700  text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                                        {LICENSE_TYPE_TO_DISCIPLINE[therapist.primaryLicenseType] ?? therapist.primaryLicenseType}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-0.5 bg-emerald-100  text-emerald-700  text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    <MdVerified className="text-sm" />
                                    Approved
                                </span>
                                {therapist.licenseVerified && (
                                    <span className="inline-flex items-center gap-0.5 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        <MdVerified className="text-sm" />
                                        License Verified
                                    </span>
                                )}
                                {therapist.insuranceVerified && (
                                    <span className="inline-flex items-center gap-0.5 bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                        <MdVerified className="text-sm" />
                                        Insured
                                    </span>
                                )}
                            </div>

                            {/* Info line */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted  mb-3">
                                {therapist.yearsOfExperience != null && (
                                    <span className="flex items-center gap-1">
                                        <MdWork className="text-base" />
                                        {therapist.yearsOfExperience} Years Exp.
                                    </span>
                                )}
                                {therapist.ratePerVisit && (
                                    <span className="flex items-center gap-1 font-semibold text-emerald-600 ">
                                        <MdAttachMoney className="text-base" />
                                        ${parseFloat(therapist.ratePerVisit).toFixed(2)}/visit
                                    </span>
                                )}
                                {therapist.attemptedVisitRate != null && parseFloat(therapist.attemptedVisitRate) > 0 && (
                                    <span className="text-xs text-text-muted ">
                                        Attempted visit: ${parseFloat(therapist.attemptedVisitRate).toFixed(2)}
                                    </span>
                                )}
                                <StarRating
                                    rating={therapist.averageRating || 0}
                                    size="sm"
                                    showValue={!!therapist.averageRating}
                                    reviewCount={therapist.reviewCount}
                                />
                            </div>

                            {/* Summary */}
                            {therapist.professionalSummary && (
                                <p className="text-sm text-text-muted  leading-relaxed mb-3">
                                    {therapist.professionalSummary}
                                </p>
                            )}

                            {/* NPI + Phone */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-4">
                                {therapist.npiNumber && (
                                    <span>NPI: {therapist.npiNumber}</span>
                                )}
                                {therapist.canViewContact ? (
                                    therapist.phone && (
                                        <span className="flex items-center gap-1.5">
                                            <MdPhone className="text-base" />
                                            {therapist.phone}
                                        </span>
                                    )
                                ) : (
                                    <span className="flex items-center gap-1.5 text-text-muted" title="Accept an offer to unlock contact info">
                                        <MdPhone className="text-base" />
                                        <span className="blur-sm select-none">(555) 000-0000</span>
                                        <MdLock className="text-xs" />
                                    </span>
                                )}
                                {therapist.canViewContact ? (
                                    therapist.email && (
                                        <span className="flex items-center gap-1.5">
                                            <MdEmail className="text-base" />
                                            {therapist.email}
                                        </span>
                                    )
                                ) : (
                                    <span className="flex items-center gap-1.5 text-text-muted" title="Accept an offer to unlock contact info">
                                        <MdEmail className="text-base" />
                                        <span className="blur-sm select-none">name@example.com</span>
                                        <MdLock className="text-xs" />
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <button
                                onClick={handleMessage}
                                className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
                            >
                                <MdChat className="text-base" />
                                Send Message
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Two-Column: Service Areas + Availability ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <ServiceAreasCard workAreas={therapist.workAreas} />
                    <AvailabilityCard availability={therapist.availability} />
                </div>

                {/* ── Clinical Skills ── */}
                {(therapist.specialties?.length > 0 || therapist.languages?.length > 0 || therapist.certifications?.length > 0) && (
                    <div className="bg-card-light border border-border-light rounded-xl p-6 sm:p-8 shadow-sm mb-6 space-y-4">
                        <h2 className="text-lg font-bold text-text-main">Clinical Skills</h2>
                        {therapist.specialties?.length > 0 && (
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Specialties</p>
                                <div className="flex flex-wrap gap-2">
                                    {therapist.specialties.map((s) => (
                                        <span key={s} className="bg-primary/10 text-primary border border-primary/20 text-sm font-semibold px-3 py-1.5 rounded-lg">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {therapist.languages?.length > 0 && (
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Languages</p>
                                <div className="flex flex-wrap gap-2">
                                    {therapist.languages.map((l) => (
                                        <span key={l} className="bg-card-light border border-border-light text-text-main text-sm font-semibold px-3 py-1.5 rounded-lg">{l}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {therapist.certifications?.length > 0 && (
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Certifications</p>
                                <div className="flex flex-wrap gap-2">
                                    {therapist.certifications.map((c) => (
                                        <span key={c} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-lg">{c}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Clinical Background ── */}
                {(therapist.pastSettings?.length > 0 || therapist.populationExperience?.length > 0 || therapist.yearsInHomeHealth != null) && (
                    <div className="bg-card-light border border-border-light rounded-xl p-6 sm:p-8 shadow-sm mb-6 space-y-4">
                        <h2 className="text-lg font-bold text-text-main">Clinical Background</h2>
                        {therapist.pastSettings?.length > 0 && (
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Past Settings</p>
                                <div className="flex flex-wrap gap-2">
                                    {therapist.pastSettings.map((s) => (
                                        <span key={s} className="bg-card-light border border-border-light text-text-main text-sm font-semibold px-3 py-1.5 rounded-lg">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {therapist.populationExperience?.length > 0 && (
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Patient Population</p>
                                <div className="flex flex-wrap gap-2">
                                    {therapist.populationExperience.map((p) => (
                                        <span key={p} className="bg-card-light border border-border-light text-text-main text-sm font-semibold px-3 py-1.5 rounded-lg">{p}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {therapist.yearsInHomeHealth != null && (
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Years in Home Health</p>
                                <p className="text-sm font-semibold text-text-main">
                                    {therapist.yearsInHomeHealth} {therapist.yearsInHomeHealth === 1 ? "year" : "years"}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Additional Rates ── */}
                {(therapist.evaluationRate != null || therapist.travelFee != null) && (
                    <div className="bg-card-light border border-border-light rounded-xl p-6 sm:p-8 shadow-sm mb-6">
                        <h2 className="text-lg font-bold text-text-main mb-4">Additional Rates</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {therapist.evaluationRate != null && (
                                <div>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Evaluation Rate</p>
                                    <p className="text-2xl font-extrabold text-text-main">${parseFloat(therapist.evaluationRate).toFixed(2)}</p>
                                </div>
                            )}
                            {therapist.travelFee != null && (
                                <div>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-1">Travel Fee</p>
                                    <p className="text-2xl font-extrabold text-text-main">${parseFloat(therapist.travelFee).toFixed(2)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Performance ── */}
                {(therapist.stats?.completedVisits > 0 || therapist.stats?.reviewCount > 0) && (
                    <div className="bg-card-light border border-border-light rounded-xl p-6 sm:p-8 shadow-sm mb-6">
                        <h2 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                            <MdBarChart className="text-primary text-xl" /> Performance
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-extrabold text-text-main">{therapist.stats.completedVisits}</p>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mt-1">Completed Visits</p>
                            </div>
                            {therapist.stats.reviewCount > 0 && (
                                <div className="text-center">
                                    <p className="text-3xl font-extrabold text-text-main flex items-center justify-center gap-1">
                                        <MdStar className="text-amber-400 text-2xl" />{therapist.stats.averageRating}
                                    </p>
                                    <p className="text-xs text-text-muted font-bold uppercase tracking-wider mt-1">
                                        Avg Rating ({therapist.stats.reviewCount} {therapist.stats.reviewCount === 1 ? "review" : "reviews"})
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Reviews Section ── */}
                <div className="bg-card-light  border border-border-light  rounded-xl p-6 sm:p-8 shadow-sm">
                    {/* Reviews header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-text-main ">
                                Reviews
                            </h2>
                            <StarRating
                                rating={therapist.averageRating || 0}
                                size="sm"
                                showValue={!!therapist.averageRating}
                                reviewCount={therapist.reviewCount}
                            />
                        </div>
                        {canReview && !showReviewForm && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="text-sm font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <MdStar className="text-base" />
                                Write a Review
                            </button>
                        )}
                    </div>

                    {/* Review Form */}
                    {showReviewForm && canReview && (
                        <div className="mb-6">
                            <ReviewForm
                                reviewableBookings={reviewableBookings}
                                therapistName={therapist.fullName}
                                onSuccess={handleReviewSuccess}
                            />
                            <button
                                onClick={() => setShowReviewForm(false)}
                                className="mt-2 text-xs text-text-muted  hover:text-text-main  transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Review List */}
                    {reviewsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 bg-slate-100  rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="text-sm text-text-muted  text-center py-8">
                            No reviews yet. {canReview ? "Be the first to leave a review!" : ""}
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </div>
                    )}

                    {/* Review Pagination */}
                    {reviewTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border-light ">
                            <button
                                onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                                disabled={reviewPage === 1}
                                className="p-2 rounded-lg border border-border-light  text-text-muted  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <MdChevronLeft className="text-lg" />
                            </button>
                            <span className="text-xs text-text-muted ">
                                Page {reviewPage} of {reviewTotalPages}
                            </span>
                            <button
                                onClick={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))}
                                disabled={reviewPage === reviewTotalPages}
                                className="p-2 rounded-lg border border-border-light  text-text-muted  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <MdChevronRight className="text-lg" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Mobile Sticky Bottom Bar ── */}
                <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card-light  border-t border-border-light  px-6 py-4 flex items-center justify-between z-50 lg:hidden">
                    <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                            name={therapist.fullName}
                            photoUrl={therapist.profilePhotoUrl}
                            size="sm"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-text-main  truncate">
                                {therapist.fullName}
                            </p>
                            <p className="text-xs text-text-muted  truncate">
                                {LICENSE_TYPE_TO_DISCIPLINE[therapist.primaryLicenseType] ?? therapist.primaryLicenseType}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleMessage}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white font-semibold rounded-lg text-sm shrink-0"
                    >
                        <MdChat className="text-base" />
                        Message
                    </button>
                </div>
            </div>
        </APIProvider>
    )

}