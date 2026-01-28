'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function TherapistBookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetchBooking();

        // Auto-refresh every 30 seconds to check for customer confirmation
        const interval = setInterval(() => {
            if (booking?.session?.status === "completed_by_therapist") {
                fetchBooking();
            }
        }, 3000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id, booking?.session?.status]);

    const fetchBooking = async () => {
        try {
            const res = await api.get(`/bookings/${params.id}`);
            setBooking(res.data.data);
        } catch (error) {
            console.error('Error fetching booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async () => {
        if (!confirm('Are you sure you want to mark this session as complete?')) {
            return;
        }

        setCompleting(true);
        try {
            await api.post(`/sessions/${booking.session.id}/complete`);
            alert('Session marked as complete! Customer will be notified to confirm.');
            fetchBooking();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.message || 'Failed to complete'));
        } finally {
            setCompleting(false);
        }
    };


    const getPaymentStatusInfo = () => {
        if (!booking.payment) return null;

        const status = booking.payment.status;
        const statusMap = {
            intent_created: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: '⏳',
                title: 'Payment Processing',
                message: 'Customer payment is being processed...',
            },
            escrowed: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: '🔒',
                title: 'Payment Secured',
                message: `Customer payment of $${booking.payment.amount} is held securely. You'll receive $${booking.payment.therapistPayout} after session confirmation.`,
            },
            released: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: '✅',
                title: 'Payment Released!',
                message: `$${booking.payment.therapistPayout} has been transferred to your Stripe account.`,
            },
            refunded: {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: '↩️',
                title: 'Session Cancelled',
                message: 'Customer cancelled and received a refund.',
            },
        };

        return statusMap[status] || null;
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
        );
    }

    const paymentInfo = getPaymentStatusInfo();

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
                                : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-semibold mb-2">Customer</h3>
                        <p className="text-lg">{booking.customer.fullName}</p>
                        <p className="text-sm text-gray-600">{booking.customer.phone}</p>
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
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Session Rate</p>
                            <p className="font-semibold">${booking.rate}</p>
                        </div>
                        {booking.payment && (
                            <>
                                <div>
                                    <p className="text-gray-600">Platform Fee (10%)</p>
                                    <p className="text-red-600">-${booking.payment.platformFee}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Your Earnings</p>
                                    <p className="font-semibold text-green-600">
                                        ${booking.payment.therapistPayout}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    {booking.payment && (
                        <div className="mt-3">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.payment.status === 'escrowed'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : booking.payment.status === 'released'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                Payment: {booking.payment.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {booking.session &&
                        booking.session.status === 'scheduled' &&
                        booking.status === 'confirmed' && (
                            <button
                                onClick={handleMarkComplete}
                                disabled={completing}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {completing ? 'Processing...' : 'Mark Session as Complete'}
                            </button>
                        )}

                    {booking.session?.status === 'completed_by_therapist' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-900 font-semibold mb-2">
                                ⏳ Waiting for customer confirmation
                            </p>
                            <p className="text-sm text-yellow-800">
                                Payment will be released once the customer confirms session completion (or automatically after 72 hours).
                            </p>
                        </div>
                    )}

                    {booking.session?.status === 'confirmed_by_customer' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-900 font-semibold mb-2">
                                ✅ Session Completed & Payment Released
                            </p>
                            <p className="text-sm text-green-800">
                                ${booking.payment.therapistPayout} has been transferred to your Stripe account.
                            </p>
                            {booking.payment.releasedAt && (
                                <p className="text-xs text-green-700 mt-2">
                                    Released on: {new Date(booking.payment.releasedAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}