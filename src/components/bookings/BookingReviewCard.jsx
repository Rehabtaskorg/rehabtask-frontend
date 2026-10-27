"use client";

import { useState } from "react";
import { MdStar, MdCheckCircle } from "react-icons/md";
import ReviewForm from "@/components/therapist/ReviewForm";
import { BOOKING_STATUS } from "@/lib/constants";

/**
 * Prompts a customer to rate a therapist once their booking is complete.
 * Renders nothing unless the booking is completed and has no review yet, so it is
 * safe to mount unconditionally on the booking detail page.
 *
 * Pass a changing `key` alongside `isFormInitiallyOpen` to open the form from a parent,
 * which remounts the component rather than syncing props into state.
 *
 * @param {{ booking: { id: string, status: string, hasReview?: boolean,
 *                      therapist?: { fullName?: string } },
 *           onReviewed?: () => void,
 *           isFormInitiallyOpen?: boolean }} props
 */
export function BookingReviewCard({ booking, onReviewed, isFormInitiallyOpen = false }) {
    const [isFormOpen, setIsFormOpen] = useState(isFormInitiallyOpen);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const isCompleted = booking?.status === BOOKING_STATUS.COMPLETED;
    const isReviewable = isCompleted && booking?.hasReview === false;

    if (!isReviewable) return null;

    const therapistName = booking.therapist?.fullName || "your therapist";

    if (isSubmitted) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-center gap-3">
                <MdCheckCircle className="text-2xl text-emerald-600 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-emerald-900">Review submitted</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                        Thank you for sharing your experience.
                    </p>
                </div>
            </div>
        );
    }

    const handleSuccess = () => {
        setIsFormOpen(false);
        setIsSubmitted(true);
        onReviewed?.();
    };

    if (isFormOpen) {
        return (
            <div>
                <ReviewForm
                    bookingId={booking.id}
                    therapistName={therapistName}
                    onSuccess={handleSuccess}
                />
                <button
                    onClick={() => setIsFormOpen(false)}
                    className="mt-2 text-sm text-text-muted hover:text-text-main hover:underline"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <section className="bg-card-light border border-border-light rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex items-start gap-3">
                <MdStar className="text-2xl text-yellow-400 shrink-0" aria-hidden="true" />
                <div>
                    <h2 className="text-base font-bold text-text-main">
                        Rate your experience
                    </h2>
                    <p className="text-sm text-text-muted mt-0.5">
                        How was working with {therapistName}? Your feedback helps other customers.
                    </p>
                </div>
            </div>
            <button
                onClick={() => setIsFormOpen(true)}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
                Write a Review
            </button>
        </section>
    );
}
