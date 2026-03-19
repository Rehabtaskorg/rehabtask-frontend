"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ booking }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const { error: submitError } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/customer/bookings/${booking.id}?payment=success`,
                },
            });

            if (submitError) {
                setError(submitError.message);
                setProcessing(false);
            }

        } catch (error) {
            setError("An unexpected error occured");
            setProcessing(false);
        }

    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Booking Summary</h3>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Therapist:</span>
                        <span className="font-medium">{booking.therapist.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Service:</span>
                        <span>{booking.offer.request.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(booking.scheduledDate).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t mt-2">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold text-lg">${booking.rate}</span>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    💡 Your payment will be held securely until you confirm session completion.
                </p>
            </div>

            <PaymentElement />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {processing ? 'Processing...' : `Pay $${booking.rate}`}
            </button>
        </form>
    );
}


export default function PaymentPage() {
    usePageTitle("Make Payment");
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookingAndCreateIntent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const fetchBookingAndCreateIntent = async () => {
        try {
            // Fetch booking details
            const bookingRes = await api.get(`/bookings/${params.id}`);
            const bookingData = bookingRes.data.data;
            setBooking(bookingData);

            if (bookingData.payment) {
                if (["escrowed", "partially_released", "released"].includes(bookingData.payment.status)) {
                    router.push(`/customers/bookings/${params.id}`);
                    return;
                }
            }

            // Create or retrieve payment intent
            // Backend already handled checking for existing payment intent
            const paymentRes = await api.post("/payments/create-intent", {
                bookingId: params.id
            });

            setClientSecret(paymentRes.data.data.clientSecret);
        } catch (err) {
            console.error("Payment error:", err);
            setError(err.response?.data?.message || "Failed to load payment")
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!booking || !clientSecret) {
        return null;
    }

    const options = {
        clientSecret,
        appearance: {
            theme: "stripe",
            variables: {
                colorPrimary: "#2563eb",
            },
        },
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
                >
                    ← Back
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm booking={booking} />
                </Elements>
            </div>
        </div>
    )

}