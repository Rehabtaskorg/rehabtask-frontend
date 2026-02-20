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
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        fetchBooking();

        if (searchParams.get("payment") === "succcess") {
            alert("Payment successful! Your session is confirmed.");
            window.history.replaceState({}, "", `/customer/bookings/${params.id}`);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id, searchParams]);

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
            await fetchBooking();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Failed to confirm"));
        } finally {
            setConfirming(false);
        }
    }

    const handleRequestRefund = async () => {
        const reason = prompt("Please provide a reason for the refund request:");
        if (!reason || reason.trim() === "") {
            alert("Refund reason is required");
            return;
        }

        if (!confirm(`Request fund for: "${reason}"?\n\nThis will cancel the booking and refund your payment.`)) {
            return;
        }

        setCancelling(true);
        try {
            await api.post("/payments/refund", {
                bookingId: params.id,
                reason,
            });
            alert("Refund processed successfully. Your payment will be returned to your card within 5-10 business days.");
            await fetchBooking();
        } catch (error) {
            alert("Error: " + (error.response?.data?.message || "Failed to process refund"))
        }

    }

    // Navigate to messaging in the context of this booking
    const handleMessageTherapist = () => {
        router.push(`/customers/messages?c=booking:${params.id}`);
    };

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

    const getPaymentStatusInfo = () => {
        if (!booking.payment) return null;

        const status = booking.payment.status;
        const statusMap = {
            intent_created: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: '⏳',
                title: 'Payment Processing',
                message: 'Payment intent created. Waiting for payment confirmation...',
            },
            escrowed: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: '🔒',
                title: 'Payment Held Securely',
                message: 'Your payment is held in escrow and will be released to the therapist after session completion.',
            },
            released: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: '✅',
                title: 'Payment Released',
                message: `$${booking.payment.therapistPayout} has been transferred to the therapist.`,
            },
            refunded: {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: '↩️',
                title: 'Payment Refunded',
                message: 'Your payment has been refunded to your original payment method.',
            },
            failed: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: '❌',
                title: 'Payment Failed',
                message: 'Payment could not be processed. Please try again.',
            },
        };

        return statusMap[status] || null;
    };

    const paymentInfo = getPaymentStatusInfo();

    return (
        <div className="py-8 px-4 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700 mb-4"
            >
                ← Back
            </button>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                {/* Header — Message Therapist button sits next to the status badge */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Booking Details</h1>
                        <p className="text-sm text-gray-600">Booking ID: {booking.id.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Message Therapist — visible on all active bookings */}
                        {['confirmed', 'in_progress', 'completed'].includes(booking.status) && (
                            <button
                                onClick={handleMessageTherapist}
                                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Message Therapist
                            </button>
                        )}
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : booking.status === 'in_progress'
                                        ? 'bg-purple-100 text-purple-800'
                                        : booking.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Therapist Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-semibold mb-2">Therapist</h3>
                        <p className="text-lg">{booking.therapist.fullName}</p>
                        <p className="text-sm text-gray-600">{booking.therapist.specialization}</p>
                        <p className="text-sm text-gray-600">{booking.therapist.phone}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Session Details</h3>
                        <p className="font-medium">{booking.offer.request.serviceType}</p>
                        <p className="text-sm text-gray-600">
                            📅 {new Date(booking.scheduledDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                            🕐 {new Date(booking.scheduledDate).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            📍 {booking.offer.request.location}
                        </p>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="border-t pt-4 mb-6">
                    <h3 className="font-semibold mb-3">Payment Information</h3>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-lg">Session Rate</span>
                        <span className="text-2xl font-bold text-blue-600">${booking.rate}</span>
                    </div>
                    {booking.payment && (
                        <div className="text-sm text-gray-600">
                            <p>Payment ID: {booking.payment.id.slice(0, 8)}...</p>
                            {booking.payment.stripePaymentIntentId && (
                                <p>Stripe: {booking.payment.stripePaymentIntentId.slice(0, 20)}...</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Payment Status Banner */}
                {paymentInfo && (
                    <div className={`border rounded-lg p-4 mb-6 ${paymentInfo.color}`}>
                        <p className="font-semibold mb-1">
                            {paymentInfo.icon} {paymentInfo.title}
                        </p>
                        <p className="text-sm">{paymentInfo.message}</p>
                        {booking.payment?.escrowedAt && (
                            <p className="text-xs mt-2">
                                Escrowed: {new Date(booking.payment.escrowedAt).toLocaleString()}
                            </p>
                        )}
                        {booking.payment?.releasedAt && (
                            <p className="text-xs mt-2">
                                Released: {new Date(booking.payment.releasedAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                )}

                {/* Session Status */}
                {booking.session && (
                    <div className="border-t pt-4 mb-6">
                        <h3 className="font-semibold mb-3">Session Status</h3>
                        <div className="space-y-2">
                            {/* Session Created */}
                            <div className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                <span className="text-sm">Session scheduled</span>
                            </div>

                            {/* Therapist Completed */}
                            {booking.session.status !== 'scheduled' && (
                                <div className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-sm">
                                        Therapist marked complete ({new Date(booking.session.completedAt).toLocaleString()})
                                    </span>
                                </div>
                            )}

                            {/* Customer Confirmed */}
                            {booking.session.status === 'confirmed_by_customer' && (
                                <div className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className="text-sm">
                                        You confirmed completion ({new Date(booking.session.confirmedByCustomerAt).toLocaleString()})
                                    </span>
                                </div>
                            )}

                            {/* Waiting for Confirmation */}
                            {booking.session.status === 'completed_by_therapist' && (
                                <div className="flex items-center">
                                    <span className="text-yellow-500 mr-2">⏳</span>
                                    <span className="text-sm">Waiting for your confirmation</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* CASE 1: Payment Not Made Yet */}
                    {booking.status === 'pending' && !booking.payment && (
                        <button
                            onClick={handleProceedToPayment}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                        >
                            Proceed to Payment
                        </button>
                    )}

                    {/* CASE 2: Payment Processing (intent_created) */}
                    {booking.payment && booking.payment.status === 'intent_created' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-900 font-semibold mb-2">⏳ Payment Processing</p>
                            <p className="text-sm text-yellow-800">
                                Your payment is being processed. This usually takes a few seconds.
                            </p>
                            <button
                                onClick={fetchBooking}
                                className="mt-3 text-sm text-yellow-700 underline hover:text-yellow-900"
                            >
                                Refresh Status
                            </button>
                        </div>
                    )}

                    {/* CASE 3: Payment Escrowed - Waiting for Session */}
                    {booking.payment && booking.payment.status === 'escrowed' &&
                        booking.session && booking.session.status === 'scheduled' && (
                            <>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-900 font-semibold mb-2">📅 Session Scheduled</p>
                                    <p className="text-sm text-blue-800">
                                        Your payment is secure. Please attend your session on the scheduled date.
                                        After the session, the therapist will mark it as complete.
                                    </p>
                                </div>
                                <button
                                    onClick={handleRequestRefund}
                                    disabled={cancelling}
                                    className="w-full border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
                                >
                                    {cancelling ? 'Processing...' : 'Cancel & Request Refund'}
                                </button>
                            </>
                        )}

                    {/* CASE 4: Therapist Marked Complete - Confirm Now */}
                    {booking.session && booking.session.status === 'completed_by_therapist' && (
                        <div className="space-y-3">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-yellow-900 font-semibold mb-2">
                                    ✋ Therapist Has Marked Session Complete
                                </p>
                                <p className="text-sm text-yellow-800 mb-3">
                                    Your therapist has indicated that the session is complete. Please confirm below to release the payment.
                                </p>
                                <p className="text-xs text-yellow-700">
                                    💡 If you don&apos;t confirm within 72 hours, the payment will be automatically released.
                                </p>
                            </div>
                            <button
                                onClick={handleConfirmCompletion}
                                disabled={confirming}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {confirming ? 'Confirming...' : '✅ Confirm Session Completion'}
                            </button>
                        </div>
                    )}

                    {/* CASE 5: Session Confirmed - Payment Released */}
                    {booking.session && booking.session.status === 'confirmed_by_customer' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-900 font-semibold mb-2">✅ Session Completed!</p>
                            <p className="text-sm text-green-800 mb-2">
                                Thank you for confirming. Payment of ${booking.payment.therapistPayout} has been released to {booking.therapist.fullName}.
                            </p>
                            {booking.payment?.releasedAt && (
                                <p className="text-xs text-green-700">
                                    Released on: {new Date(booking.payment.releasedAt).toLocaleString()}
                                </p>
                            )}
                            {booking.payment?.stripeTransferId && (
                                <p className="text-xs text-green-700 mt-1">
                                    Transfer ID: {booking.payment.stripeTransferId}
                                </p>
                            )}
                        </div>
                    )}

                    {/* CASE 6: Cancelled/Refunded */}
                    {booking.status === 'cancelled' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-900 font-semibold mb-2">Booking Cancelled</p>
                            <p className="text-sm text-gray-800">
                                This booking has been cancelled.
                            </p>
                            {booking.session?.cancellationReason && (
                                <p className="text-xs text-gray-600 mt-2">
                                    Reason: {booking.session.cancellationReason}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-4">Booking Timeline</h3>
                <div className="space-y-3">
                    <div className="flex">
                        <div className="shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                        <div className="ml-4">
                            <p className="text-sm font-medium">Booking Created</p>
                            <p className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    {booking.payment && (
                        <div className="flex">
                            <div className={`shrink-0 w-2 h-2 mt-2 rounded-full ${booking.payment.status === 'escrowed' || booking.payment.status === 'released'
                                ? 'bg-blue-500'
                                : 'bg-gray-300'
                                }`}></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium">Payment Escrowed</p>
                                <p className="text-xs text-gray-500">
                                    {booking.payment.escrowedAt
                                        ? new Date(booking.payment.escrowedAt).toLocaleString()
                                        : 'Pending...'}
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.session && booking.session.completedAt && (
                        <div className="flex">
                            <div className="shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium">Therapist Marked Complete</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(booking.session.completedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.session && booking.session.confirmedByCustomerAt && (
                        <div className="flex">
                            <div className="shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium">Customer Confirmed</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(booking.session.confirmedByCustomerAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {booking.payment && booking.payment.releasedAt && (
                        <div className="flex">
                            <div className="shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium">Payment Released</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(booking.payment.releasedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}