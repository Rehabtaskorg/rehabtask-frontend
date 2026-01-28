"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function TherapistBookingPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await api.get("/bookings/therapist");
            setBookings(res.data.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="py-8 px-4">
                <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">No bookings yet</p>
                    <button
                        onClick={() => router.push('/therapist/requests')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Browse Requests
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <div
                            key={booking.id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/therapist/bookings/${booking.id}`)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{booking.customer.fullName}</h3>
                                    <p className="text-sm text-gray-600">{booking.offer.request.serviceType}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date(booking.scheduledDate).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Your Earnings</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ${booking.payment?.therapistPayout || (booking.rate * 0.9).toFixed(2)}
                                    </p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(booking.status)}`}>
                                        {booking.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}