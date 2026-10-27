"use client";

import { useState } from "react";
import { MdCheckCircle } from "react-icons/md";
import { useCreateReview } from "@/hooks/useReviews";
import { REVIEW_CATEGORIES } from "@/lib/constants";
import StarRating from "./StarRating";
import Button from "../ui/Button";

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const EMPTY_RATINGS = REVIEW_CATEGORIES.reduce(
    (acc, category) => ({ ...acc, [category.field]: 0 }),
    {}
);

/**
 * Three-point review form — Communication, Timely Documentation, Professionalism.
 * All three ratings are required; the overall score is computed server-side.
 *
 * @param {{ reviewableBookings?: Array<{id: string, scheduledDate: string}>,
 *           therapistName: string,
 *           bookingId?: string,
 *           onSuccess?: () => void }} props
 */
export default function ReviewForm({ reviewableBookings, therapistName, bookingId, onSuccess }) {
    const [selectedBookingId, setSelectedBookingId] = useState(
        bookingId || (reviewableBookings?.length === 1 ? reviewableBookings[0].id : "")
    );
    const [ratings, setRatings] = useState(EMPTY_RATINGS);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const createReview = useCreateReview();

    const isBookingPreset = Boolean(bookingId);
    const showBookingSelector = !isBookingPreset && reviewableBookings?.length > 1;
    const missingRating = REVIEW_CATEGORIES.find((category) => ratings[category.field] < 1);

    const setRating = (field, value) =>
        setRatings((previous) => ({ ...previous, [field]: value }));

    const handleSubmit = async () => {
        setError("");

        if (!selectedBookingId) {
            setError("Please select a session to review.");
            return;
        }
        if (missingRating) {
            setError(`Please rate ${missingRating.label}.`);
            return;
        }

        try {
            await createReview.mutateAsync({
                bookingId: selectedBookingId,
                ...ratings,
                comment: comment.trim() || undefined,
            });
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            const status = err.response?.status;
            if (status === 409) {
                setError("You have already reviewed this session.");
                return;
            }
            if (status === 403) {
                setError("Your account needs to be approved before you can leave a review.");
                return;
            }
            setError(err.response?.data?.message || "Failed to submit review. Please try again.");
        }
    };

    if (showSuccess) {
        return (
            <div className="bg-emerald-50  border border-emerald-200  rounded-xl p-6 text-center">
                <MdCheckCircle className="text-3xl text-emerald-600  mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900 ">
                    Review submitted!
                </p>
                <p className="text-xs text-emerald-700  mt-1">
                    Thank you for sharing your experience.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card-light  border border-border-light  rounded-xl p-6">
            <h4 className="text-base font-bold text-text-main  mb-1">
                Write a Review
            </h4>
            <p className="text-sm text-text-muted  mb-5">
                Share your experience with {therapistName}
            </p>

            {showBookingSelector && (
                <div className="mb-5">
                    <label htmlFor="review-session" className="text-xs font-semibold text-text-muted  uppercase tracking-wider block mb-1.5">
                        Session
                    </label>
                    <select
                        id="review-session"
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white  border border-border-light  focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main  transition-all outline-none text-sm"
                    >
                        <option value="">Select a session...</option>
                        {reviewableBookings.map((b) => (
                            <option key={b.id} value={b.id}>
                                Session on {formatDate(b.scheduledDate)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-4 mb-5">
                {REVIEW_CATEGORIES.map((category) => (
                    <div key={category.field}>
                        <p className="text-sm font-semibold text-text-main ">
                            {category.label}
                        </p>
                        <p className="text-xs text-text-muted  mb-1.5">
                            {category.description}
                        </p>
                        <div className="flex items-center gap-3">
                            <StarRating
                                rating={ratings[category.field]}
                                size="lg"
                                interactive
                                onChange={(value) => setRating(category.field, value)}
                            />
                            <span className="text-xs text-text-muted ">
                                {ratings[category.field] > 0
                                    ? `${ratings[category.field]} of 5`
                                    : "Not rated"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-5">
                <label htmlFor="review-comment" className="text-xs font-semibold text-text-muted  uppercase tracking-wider block mb-1.5">
                    Your Review
                </label>
                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 2000))}
                    placeholder="Tell others about your experience... (optional)"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white  border border-border-light  focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main  placeholder:text-text-muted/50 transition-all outline-none resize-none text-sm"
                />
                <p className="text-xs text-text-muted  mt-1 text-right">
                    {comment.length}/2000
                </p>
            </div>

            {error && (
                <p className="text-sm text-red-600  mb-4" role="alert">
                    {error}
                </p>
            )}

            <Button
                variant="primary"
                size="md"
                loading={createReview.isPending}
                fullWidth
                onClick={handleSubmit}
            >
                Submit Review
            </Button>
        </div>
    );
}
