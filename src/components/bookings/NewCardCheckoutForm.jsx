"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { formatCurrency } from "@/utils/messages";

/**
 * @param {Object}   props
 * @param {Object}   props.booking      - Booking object (used for return_url on 3DS redirect)
 * @param {number}   props.totalAmount  - Pre-computed total charge amount (rate × sessions)
 * @param {Function} props.onSuccess    - Called when payment confirms without redirect
 */
export default function NewCardCheckoutForm({ booking, totalAmount, onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setProcessing(true);
        setError(null);
        try {
            const { error: submitError } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/customer/bookings/${booking.id}?payment=success`,
                },
            });
            if (submitError) setError(submitError.message);
        } catch {
            setError("An unexpected error occurred.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && <p className="text-sm text-red-600 ">{error}</p>}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-colors disabled:opacity-50 text-sm"
            >
                {processing ? "Processing..." : `Pay ${formatCurrency(totalAmount)}`}
            </button>
        </form>
    );
}
