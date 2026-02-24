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
            pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
            confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
            in_progress: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
            completed: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
            cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        };
        return colors[status] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    };

    if (loading) {
        return (
            <div className="py-6 px-4 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">My Bookings</h1>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 px-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-text-main dark:text-white mb-6">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-10 text-center">
                    <p className="text-text-muted dark:text-gray-400 mb-4">No bookings yet</p>
                    <button
                        onClick={() => router.push('/therapist/requests')}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:opacity-90 font-semibold text-sm"
                    >
                        Browse Requests
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map(booking => (
                        <div
                            key={booking.id}
                            className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/therapist/bookings/${booking.id}`)}
                        >
                            {/* Stack vertically on mobile, side-by-side on sm+ */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                {/* Left: customer info */}
                                <div>
                                    <h3 className="font-semibold text-text-main dark:text-white">
                                        {booking.customer.fullName}
                                    </h3>
                                    <p className="text-sm text-text-muted dark:text-gray-400">
                                        {booking.offer.request.serviceType}
                                    </p>
                                    <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
                                        {new Date(booking.scheduledDate).toLocaleString()}
                                    </p>
                                </div>
                                {/* Right: earnings + status */}
                                <div className="flex sm:flex-col sm:items-end items-center gap-3 sm:gap-1">
                                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ${booking.payment?.therapistPayout || (booking.rate * 0.9).toFixed(2)}
                                    </p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
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