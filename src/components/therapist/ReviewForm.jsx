"use client";

import { useState } from "react";
import { MdCheckCircle } from "react-icons/md";
import { useCreateReview } from "@/hooks/useReviews";
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

export default function ReviewForm({ reviewableBookings, therapistName, onSuccess }) {
    const [selectedBookingId, setSelectedBookingId] = useState(
        reviewableBookings?.length === 1 ? reviewableBookings[0].id : ""
    );
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const createReview = useCreateReview();

    const handleSubmit = async () => {
        setError("");

        if (!selectedBookingId) {
            setError("Please select a session to review.");
            return;
        }
        if (rating < 1) {
            setError("Please select a rating.");
            return;
        }

        try {
            await createReview.mutateAsync({
                bookingId: selectedBookingId,
                rating,
                comment: comment.trim() || undefined,
            });
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Failed to submit review. Please try again.";
            setError(msg);
        }
    };

    if (showSuccess) {
        return (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center">
                <MdCheckCircle className="text-3xl text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Review submitted!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                    Thank you for sharing your experience.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6">
            {/* Header */}
            <h4 className="text-base font-bold text-text-main dark:text-white mb-1">
                Write a Review
            </h4>
            <p className="text-sm text-text-muted dark:text-gray-400 mb-5">
                Share your experience with {therapistName}
            </p>

            {/* Booking selector */}
            {reviewableBookings && reviewableBookings.length > 1 && (
                <div className="mb-5">
                    <label className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider block mb-1.5">
                        Session
                    </label>
                    <select
                        value={selectedBookingId}
                        onChange={(e) => setSelectedBookingId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white transition-all outline-none text-sm"
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

            {/* Star Rating */}
            <div className="mb-5">
                <label className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider block mb-2">
                    Your Rating
                </label>
                <StarRating
                    rating={rating}
                    size="lg"
                    interactive
                    onChange={setRating}
                />
            </div>

            {/* Comment */}
            <div className="mb-5">
                <label className="text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider block mb-1.5">
                    Your Review
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 2000))}
                    placeholder="Tell others about your experience... (optional)"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-main dark:text-white placeholder:text-text-muted/50 transition-all outline-none resize-none text-sm"
                />
                <p className="text-xs text-text-muted dark:text-gray-500 mt-1 text-right">
                    {comment.length}/2000
                </p>
            </div>

            {/* Error */}
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    {error}
                </p>
            )}

            {/* Submit */}
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