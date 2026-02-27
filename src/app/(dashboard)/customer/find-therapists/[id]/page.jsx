"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MdChevronRight, MdVerified, MdWork, MdMedicalServices, MdPhone, MdChat, MdStar, MdChevronLeft, MdRefresh, MdArrowBack,
} from "react-icons/md";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useTherapistPublicProfile, useTherapistReviews } from "@/hooks/useTherapistSearch";
import UserAvatar from "@/components/ui/UserAvatar";
import StarRating from "@/components/therapist/StarRating";
import ServiceAreasCard from "@/components/therapist/ServiceAreasCard";
import AvailabilityCard from "@/components/therapist/AvailabilityCard";
import ReviewCard from "@/components/therapist/ReviewCard";
import ReviewForm from "@/components/therapist/ReviewForm";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export default function TherapistProfilePage() {
    const params = useParams();
    const router = useRouter();
    const therapistId = params.id;

    const { therapist, loading, error, refetch } = useTherapistPublicProfile(therapistId);
    const [reviewPage, setReviewPage] = useState(1);

    const { reviews, pagination: reviewPagination, loading: reviewsLoading } = useTherapistReviews(therapistId, reviewPage);

    const [showReviewForm, setShowReviewForm] = useState(false);

    const handleMessage = () => {
        router.push("/customer/messages");
    };

    const handleReviewSuccess = () => {
        setShowReviewForm(false);
        refetch();
    };

    // ─── Loading ────
    if (loading) {
        return (
            <div className="p-4 sm:p-8 max-w-5xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-48 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-64 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                        <div className="h-64 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                    </div>
                    <div className="h-40 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl" />
                </div>
            </div>
        );
    }

    // ─── Error ────
    if (error || !therapist) {
        return (
            <div className="p-4 sm:p-8 max-w-5xl mx-auto">
                <button
                    onClick={() => router.push("/customer/find-therapists")}
                    className="flex items-center gap-1 text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors mb-6"
                >
                    <MdArrowBack className="text-base" /> Back to Search
                </button>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <p className="text-red-700 dark:text-red-400 font-semibold">Therapist not found</p>
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
            <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1 text-sm mb-6">
                    <button
                        onClick={() => router.push("/customer/find-therapists")}
                        className="text-primary hover:underline font-medium"
                    >
                        Find Therapists
                    </button>
                    <MdChevronRight className="text-text-muted dark:text-gray-500" />
                    <span className="text-text-main dark:text-white font-medium truncate">
                        {therapist.fullName}
                    </span>
                </nav>

                {/* ── Profile Header Card ── */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 sm:p-8 shadow-sm mb-6">
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
                                <h1 className="text-2xl font-bold text-text-main dark:text-white">
                                    {therapist.fullName}
                                </h1>
                                {therapist.primaryLicenseType && (
                                    <span className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                                        {therapist.primaryLicenseType}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    <MdVerified className="text-sm" />
                                    Verified
                                </span>
                            </div>

                            {/* Info line */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted dark:text-gray-400 mb-3">
                                {therapist.specialization && (
                                    <span className="flex items-center gap-1">
                                        <MdMedicalServices className="text-base" />
                                        {therapist.specialization}
                                    </span>
                                )}
                                {therapist.yearsOfExperience != null && (
                                    <span className="flex items-center gap-1">
                                        <MdWork className="text-base" />
                                        {therapist.yearsOfExperience} Years Exp.
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
                                <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed mb-3">
                                    {therapist.professionalSummary}
                                </p>
                            )}

                            {/* Phone */}
                            {therapist.phone && (
                                <p className="flex items-center gap-1.5 text-sm text-text-muted dark:text-gray-400 mb-4">
                                    <MdPhone className="text-base" />
                                    {therapist.phone}
                                </p>
                            )}

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

                {/* ── Reviews Section ── */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 sm:p-8 shadow-sm">
                    {/* Reviews header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-text-main dark:text-white">
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
                                className="mt-2 text-xs text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Review List */}
                    {reviewsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <p className="text-sm text-text-muted dark:text-gray-400 text-center py-8">
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
                        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border-light dark:border-border-dark">
                            <button
                                onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                                disabled={reviewPage === 1}
                                className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <MdChevronLeft className="text-lg" />
                            </button>
                            <span className="text-xs text-text-muted dark:text-gray-400">
                                Page {reviewPage} of {reviewTotalPages}
                            </span>
                            <button
                                onClick={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))}
                                disabled={reviewPage === reviewTotalPages}
                                className="p-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <MdChevronRight className="text-lg" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Mobile Sticky Bottom Bar ── */}
                <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card-light dark:bg-card-dark border-t border-border-light dark:border-border-dark px-6 py-4 flex items-center justify-between z-50 lg:hidden">
                    <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                            name={therapist.fullName}
                            photoUrl={therapist.profilePhotoUrl}
                            size="sm"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-text-main dark:text-white truncate">
                                {therapist.fullName}
                            </p>
                            <p className="text-xs text-text-muted dark:text-gray-400 truncate">
                                {therapist.specialization}
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