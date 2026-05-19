"use client";

import { useState } from "react";
import { MdStar, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { useTherapistReviews } from "@/hooks/useTherapistSearch";
import StarRating from "./StarRating";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";

/**
 * Self-contained review section that manages its own pagination and review form state.
 * Can be used as a drop-in replacement for the inline reviews in the profile page.
 */
export default function ReviewSection({
    therapistId,
    therapistName,
    averageRating,
    reviewCount,
    reviewableBookings,
    onReviewSuccess,
}) {
    const [reviewPage, setReviewPage] = useState(1);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const { reviews, pagination, loading } = useTherapistReviews(therapistId, reviewPage);

    const canReview = reviewableBookings && reviewableBookings.length > 0;
    const totalPages = pagination?.totalPages || 1;

    const handleSuccess = () => {
        setShowReviewForm(false);
        if (onReviewSuccess) onReviewSuccess();
    };

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-text-main ">Reviews</h2>
                    <StarRating
                        rating={averageRating || 0}
                        size="sm"
                        showValue={!!averageRating}
                        reviewCount={reviewCount}
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
                        therapistName={therapistName}
                        onSuccess={handleSuccess}
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
            {loading ? (
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-border-light ">
                    <button
                        onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                        disabled={reviewPage === 1}
                        className="p-2 rounded-lg border border-border-light  text-text-muted  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <MdChevronLeft className="text-lg" />
                    </button>
                    <span className="text-xs text-text-muted ">
                        Page {reviewPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setReviewPage((p) => Math.min(totalPages, p + 1))}
                        disabled={reviewPage === totalPages}
                        className="p-2 rounded-lg border border-border-light  text-text-muted  hover:bg-slate-50  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <MdChevronRight className="text-lg" />
                    </button>
                </div>
            )}
        </div>
    );
}