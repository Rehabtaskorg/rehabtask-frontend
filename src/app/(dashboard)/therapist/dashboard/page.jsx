"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function TherapistDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        availableRequests: 0,
        upcomingBookings: 0,
        completedSessions: 0,
        totalEarnings: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [stripeStatus, setStripeStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [requestRes, bookingRes, earningRes, stripeRes] = await Promise.all([
                api.get("/requests/available"),
                api.get("/bookings/therapist"),
                api.get("/payments/payouts"),
                api.get("/payments/connect/status").catch(() => ({ data: { data: { connected: false } } })),
            ]);

            const requests = requestRes.data.data;
            const bookings = bookingRes.data.data;
            const earnings = earningRes.data.data;

            setRecentRequests(requests.slice(0, 3));
            setUpcomingBookings(bookings.filter(b => b.status === "confirmed").slice(0, 3));
            setStripeStatus(stripeRes.data.data);

            console.log("Stripe Status:", stripeStatus);

            setStats({
                availableRequests: requests.filter(r => ["created", "offers_received"].includes(r.status)).length,
                upcomingBookings: bookings.filter(b => b.status === "confirmed").length,
                completedSessions: bookings.filter(b => b.status === "completed").length,
                totalEarnings: earnings.totalEarnings || 0,
            });
        } catch (error) {
            console.error("Error fetching dashboard data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="py-8 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* Stripe Warning */}
            {!stripeStatus?.connected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-900 font-semibold mb-2">⚠️ Connect your Stripe account</p>
                    <p className="text-sm text-yellow-800 mb-3">
                        You need to connect Stripe to receive payments for your sessions.
                    </p>
                    <button
                        onClick={() => router.push('/therapist/profile')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                    >
                        Connect Stripe Now
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Available Requests</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.availableRequests}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Upcoming Bookings</p>
                    <p className="text-3xl font-bold text-green-600">{stats.upcomingBookings}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Completed Sessions</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.completedSessions}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Total Earnings</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/therapist/requests')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Browse Requests
                    </button>
                    <button
                        onClick={() => router.push('/therapist/earnings')}
                        className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
                    >
                        View Earnings
                    </button>
                </div>
            </div>

            {/* Available Requests */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Available Requests</h2>
                    <Link href="/therapist/requests" className="text-blue-600 text-sm hover:text-blue-700">
                        View All →
                    </Link>
                </div>
                {recentRequests.length === 0 ? (
                    <p className="text-gray-600">No available requests at the moment</p>
                ) : (
                    <div className="space-y-3">
                        {recentRequests.map(req => (
                            <div
                                key={req.id}
                                className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => router.push(`/therapist/requests/${req.id}`)}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{req.serviceType}</p>
                                        <p className="text-sm text-gray-600">{req.location}</p>
                                    </div>
                                    <span className="text-xs text-blue-600">~10 miles</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upcoming Bookings */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
                    <Link href="/therapist/bookings" className="text-blue-600 text-sm hover:text-blue-700">
                        View All →
                    </Link>
                </div>
                {upcomingBookings.length === 0 ? (
                    <p className="text-gray-600">No upcoming bookings</p>
                ) : (
                    <div className="space-y-3">
                        {upcomingBookings.map(booking => (
                            <div
                                key={booking.id}
                                className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => router.push(`/therapist/bookings/${booking.id}`)}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{booking.customer.fullName}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.scheduledDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600">
                                        ${booking.payment?.therapistPayout || (booking.rate * 0.9).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}