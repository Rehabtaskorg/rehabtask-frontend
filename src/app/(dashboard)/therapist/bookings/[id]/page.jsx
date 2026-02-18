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
    // Navigate to messaging in the context of this booking
    const handleMessageCustomer = () => {
        router.push(`/therapist/messages/booking/${params.id}`);
    }


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

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                {/* Header — Message Customer button sits next to the status badge */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Booking Details</h1>
                        <p className="text-sm text-gray-600">Booking ID: {booking.id.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Message Customer — visible on all active bookings */}
                        {['confirmed', 'in_progress', 'completed'].includes(booking.status) && (
                            <button
                                onClick={handleMessageCustomer}
                                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Message Customer
                            </button>
                        )}
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'confirmed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : booking.status === 'in_progress'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="font-semibold mb-2">Customer</h3>
                        <p className="text-lg">{booking.customer.fullName}</p>
                        <p className="text-sm text-gray-600">{booking.customer.phone}</p>
                        <p className="text-sm text-gray-600">{booking.customer.location}</p>
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

                {/* Request Details */}
                <div className="border-t pt-4 mb-6">
                    <h3 className="font-semibold mb-2">Customer&apos;s Request</h3>
                    <p className="text-gray-700">{booking.offer.request.description}</p>
                </div>

                {/* Payment Info */}
                <div className="border-t pt-4 mb-6">
                    <h3 className="font-semibold mb-3">Payment Information</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                            <p className="text-gray-600">Session Rate</p>
                            <p className="font-semibold text-lg">${booking.rate}</p>
                        </div>
                        {booking.payment && (
                            <>
                                <div>
                                    <p className="text-gray-600">Platform Fee (10%)</p>
                                    <p className="text-red-600 font-semibold">-${booking.payment.platformFee}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Your Earnings</p>
                                    <p className="font-semibold text-lg text-green-600">
                                        ${booking.payment.therapistPayout}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    {booking.payment && (
                        <div className="text-xs text-gray-500">
                            <p>Payment ID: {booking.payment.id.slice(0, 8)}...</p>
                            {booking.payment.stripeTransferId && (
                                <p>Transfer ID: {booking.payment.stripeTransferId}</p>
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

                {/* Session Status Progress */}
                {booking.session && (
                    <div className="border-t pt-4 mb-6">
                        <h3 className="font-semibold mb-3">Session Progress</h3>
                        <div className="space-y-3">
                            {/* Step 1: Session Scheduled */}
                            <div className="flex items-start">
                                <span className="text-green-500 mr-3 text-xl">✓</span>
                                <div>
                                    <p className="font-medium">Session Scheduled</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(booking.session.scheduledDate).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Step 2: Payment Secured */}
                            {booking.payment && booking.payment.status === 'escrowed' && (
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-3 text-xl">✓</span>
                                    <div>
                                        <p className="font-medium">Payment Secured</p>
                                        <p className="text-sm text-gray-600">
                                            Customer paid ${booking.payment.amount}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Session Completion */}
                            {booking.session.status === 'scheduled' && (
                                <div className="flex items-start">
                                    <span className="text-gray-400 mr-3 text-xl">○</span>
                                    <div>
                                        <p className="font-medium text-gray-600">Attend Session</p>
                                        <p className="text-sm text-gray-500">
                                            Mark complete after the session
                                        </p>
                                    </div>
                                </div>
                            )}

                            {booking.session.status !== 'scheduled' && (
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-3 text-xl">✓</span>
                                    <div>
                                        <p className="font-medium">You Marked Complete</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.session.completedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Customer Confirmation */}
                            {booking.session.status === 'completed_by_therapist' && (
                                <div className="flex items-start">
                                    <span className="text-yellow-500 mr-3 text-xl">⏳</span>
                                    <div>
                                        <p className="font-medium text-yellow-700">Waiting for Customer</p>
                                        <p className="text-sm text-gray-600">
                                            Customer needs to confirm completion
                                        </p>
                                    </div>
                                </div>
                            )}

                            {booking.session.status === 'confirmed_by_customer' && (
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-3 text-xl">✓</span>
                                    <div>
                                        <p className="font-medium">Customer Confirmed</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.session.confirmedByCustomerAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Payment Released */}
                            {booking.payment && booking.payment.status === 'released' && (
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-3 text-xl">✓</span>
                                    <div>
                                        <p className="font-medium text-green-700">Payment Released!</p>
                                        <p className="text-sm text-gray-600">
                                            ${booking.payment.therapistPayout} transferred to your account
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* CASE 1: Waiting for Payment */}
                    {booking.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-900 font-semibold mb-1">⏳ Waiting for Customer Payment</p>
                            <p className="text-sm text-yellow-800">
                                The customer needs to complete payment before the session is confirmed.
                            </p>
                        </div>
                    )}

                    {/* CASE 2: Payment Processing */}
                    {booking.payment && booking.payment.status === 'intent_created' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-900 font-semibold mb-1">💳 Payment Processing</p>
                            <p className="text-sm text-blue-800">
                                Customer&apos;s payment is being processed. This usually takes a few seconds.
                            </p>
                            <button
                                onClick={fetchBooking}
                                className="mt-2 text-sm text-blue-700 underline hover:text-blue-900"
                            >
                                Refresh Status
                            </button>
                        </div>
                    )}

                    {/* CASE 3: Ready for Session - Mark Complete Button */}
                    {booking.session && booking.session.status === 'scheduled' &&
                        booking.status === 'confirmed' && (
                            <>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-green-900 font-semibold mb-1">✅ Ready for Session</p>
                                    <p className="text-sm text-green-800 mb-2">
                                        Payment is secured. After completing the session, click the button below.
                                    </p>
                                    <p className="text-xs text-green-700">
                                        💡 You&apos;ll receive ${booking.payment.therapistPayout} once the customer confirms completion.
                                    </p>
                                </div>
                                <button
                                    onClick={handleMarkComplete}
                                    disabled={completing}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {completing ? 'Processing...' : '✓ Mark Session as Complete'}
                                </button>
                            </>
                        )}

                    {/* CASE 4: Waiting for Customer Confirmation */}
                    {booking.session && booking.session.status === 'completed_by_therapist' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-900 font-semibold mb-2">⏳ Waiting for Customer Confirmation</p>
                            <p className="text-sm text-yellow-800 mb-3">
                                You&apos;ve marked the session as complete. The customer has been notified and needs to confirm.
                            </p>
                            <div className="bg-white rounded p-3 mb-3">
                                <p className="text-xs font-semibold text-gray-700 mb-1">What happens next:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Customer confirms → Payment released immediately</li>
                                    <li>• No response in 72 hours → Payment released automatically</li>
                                </ul>
                            </div>
                            <button
                                onClick={fetchBooking}
                                className="text-sm text-yellow-700 underline hover:text-yellow-900"
                            >
                                Check if customer has confirmed
                            </button>
                        </div>
                    )}

                    {/* CASE 5: Payment Released - Success! */}
                    {booking.session && booking.session.status === 'confirmed_by_customer' &&
                        booking.payment && booking.payment.status === 'released' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-900 font-semibold mb-2">🎉 Payment Released!</p>
                                <p className="text-sm text-green-800 mb-3">
                                    Congratulations! ${booking.payment.therapistPayout} has been transferred to your Stripe account.
                                </p>
                                <div className="bg-white rounded p-3">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">Payment Details:</p>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                        <li>• Session Rate: ${booking.payment.amount}</li>
                                        <li>• Platform Fee: -${booking.payment.platformFee}</li>
                                        <li>• Your Earnings: ${booking.payment.therapistPayout}</li>
                                        {booking.payment.releasedAt && (
                                            <li>• Released: {new Date(booking.payment.releasedAt).toLocaleString()}</li>
                                        )}
                                        {booking.payment.stripeTransferId && (
                                            <li>• Transfer ID: {booking.payment.stripeTransferId}</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}

                    {/* CASE 6: Cancelled */}
                    {booking.status === 'cancelled' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-900 font-semibold mb-1">Session Cancelled</p>
                            <p className="text-sm text-gray-800">
                                This booking has been cancelled by the customer.
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

            {/* Help Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-2">💡 Need Help?</p>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Sessions are in-person at the customer&lsquo;s location</li>
                    <li>• Mark complete only after the session is finished</li>
                    <li>• Payment is held securely until customer confirmation</li>
                    <li>• Auto-release after 72 hours if customer doesn&lsquo;t respond</li>
                </ul>
            </div>
        </div>
    );
}