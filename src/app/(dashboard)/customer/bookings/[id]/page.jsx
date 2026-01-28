"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function CustomerBookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        fetchBooking();

        if (searchParams.get("payment") === "succcess") {
            alert("Payment successful! Your session is confirmed.");
            window.history.replaceState({}, "", `/customer/bookings/${params.id}`);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);

    const fetchBooking = async () => {
        try {
            const res = await api.get(`/bookings/${params.id}`);
            setBooking(res.data.data);
        } catch (error) {
            console.error("Error fetching booking:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleProceedToPayment = () => {
        router.push(`/customer/bookings/${params.id}/payment`);
    }

    const handleConfirmCompletion = async () => {
        if (!confirm("Are you sure you want to confirm session completion? Payment will be released to the therapist.")) {
            return;
        }

        setConfirming(true);
        try {
            await api.post(`/sessions/${booking.session.id}/confirm`);
            alert("Session confirmed! Payment has been released to the therapist.");
            fetchBooking();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Failed to confirm"));
        } finally {
            setConfirming(false);
        }
    }

    const handleRequestRefund = async () => {
        const reason = prompt("Please provide a reason for the refund request:");
        if (!reason) return;

        try {
            await api.post("/payments/refund", {
                bookingId: params.id,
                reason,
            });
            alert("Refund processed successfully");
            fetchBooking();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Failed to process refund"))
        }

    }

    if (loading) {
        return (
            <div className="py-8 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-800">Booking not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="py-8 px-4 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700 mb-4"
            >
                ← Back
            </button>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Booking Details</h1>
                        <p className="text-gray-600">Booking ID: {booking.id}</p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : booking.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-semibold mb-2">Therapist</h3>
                        <p className="text-lg">{booking.therapist.fullName}</p>
                        <p className="text-sm text-gray-600">{booking.therapist.specialization}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Session Details</h3>
                        <p>{booking.offer.request.serviceType}</p>
                        <p className="text-sm text-gray-600">
                            {new Date(booking.scheduledDate).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="border-t pt-4 mb-6">
                    <h3 className="font-semibold mb-2">Payment</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">${booking.rate}</span>
                        {booking.payment && (
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.payment.status === 'escrowed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : booking.payment.status === 'released'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {booking.payment.status.replace('_', ' ').toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {booking.status === 'pending' && !booking.payment && (
                        <button
                            onClick={handleProceedToPayment}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Proceed to Payment
                        </button>
                    )}

                    {booking.session &&
                        booking.session.status === 'completed_by_therapist' && (
                            <div className="space-y-3">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-yellow-900 font-semibold mb-2">
                                        ⚠️ Therapist has marked this session as complete
                                    </p>
                                    <p className="text-sm text-yellow-800">
                                        Please confirm completion to release payment to the therapist.
                                    </p>
                                </div>
                                <button
                                    onClick={handleConfirmCompletion}
                                    disabled={confirming}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    {confirming ? 'Confirming...' : 'Confirm Session Completion'}
                                </button>
                            </div>
                        )}

                    {booking.status === 'confirmed' &&
                        booking.payment?.status === 'escrowed' &&
                        (!booking.session || booking.session.status === 'scheduled') && (
                            <button
                                onClick={handleRequestRefund}
                                className="w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50"
                            >
                                Request Cancellation & Refund
                            </button>
                        )}

                    {booking.session?.status === 'confirmed_by_customer' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-900 font-semibold mb-2">
                                ✅ Session Completed
                            </p>
                            <p className="text-sm text-green-800">
                                Payment of ${booking.payment.therapistPayout} has been released to the therapist.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

}