"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CustomerDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        activeRequests: 0,
        upcomingBookings: 0,
        completedSessions: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [requestRes, bookingRes] = await Promise.all([
                api.get("/requests/my-requests"),
                api.get('/bookings/customer'),
            ]);

            const requests = Array.isArray(requestRes.data.data) ? requestRes.data.data : [];
            const bookings = Array.isArray(bookingRes.data.data) ? bookingRes.data.data : [];

            setRecentRequests(requests.slice(0, 3));
            setUpcomingBookings(bookings.filter(b => b.status === "confirmed").slice(0, 3));

            setStats({
                activeRequests: requests.filter(r => ["created", "offers_received"].includes(r.status)).length,
                upcomingBookings: bookings.filter(b => b.status === "confirmed").length,
                completedSessions: bookings.filter(b => b.status === "completed").length,
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="py-8 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Active Requests</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.activeRequests}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Upcoming Bookings</p>
                    <p className="text-3xl font-bold text-green-600">{stats.upcomingBookings}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-sm text-gray-600">Completed Sessions</p>
                    <p className="text-3xl font-bold text-gray-600">{stats.completedSessions}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/customer/requests/new')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        + Create New Request
                    </button>
                    <button
                        onClick={() => router.push('/customer/requests')}
                        className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50"
                    >
                        View All Requests
                    </button>
                </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Recent Requests</h2>
                    <Link href="/customer/requests" className="text-blue-600 text-sm hover:text-blue-700">
                        View All →
                    </Link>
                </div>
                {recentRequests.length === 0 ? (
                    <p className="text-gray-600">No requests yet. Create your first request!</p>
                ) : (
                    <div className="space-y-3">
                        {recentRequests.map(req => (
                            <div
                                key={req.id}
                                className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => router.push(`/customer/requests/${req.id}`)}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{req.serviceType}</p>
                                        <p className="text-sm text-gray-600">{req.location}</p>
                                    </div>
                                    <span className="text-sm text-blue-600">{req.offers?.length || 0} offers</span>
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
                    <Link href="/customer/bookings" className="text-blue-600 text-sm hover:text-blue-700">
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
                                onClick={() => router.push(`/customer/bookings/${booking.id}`)}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-medium">{booking.therapist.fullName}</p>
                                        <p className="text-sm text-gray-600">
                                            {new Date(booking.scheduledDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-sm font-semibold">${booking.rate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )

}