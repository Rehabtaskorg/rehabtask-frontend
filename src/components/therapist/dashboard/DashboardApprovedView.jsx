"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
    MdNotifications, MdWarning,
    MdArrowForward, MdNearMe,
    MdPendingActions,
    MdCheckCircle, MdLocationOn,
    MdCalendarToday
} from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/ui/UserAvatar";

export default function DashboardApprovedView() {
    const { user } = useAuth();
    const profilePhotoUrl = user?.profile?.profilePhotoUrl;
    const fullName = user?.profile?.fullName || "";
    const router = useRouter();
    const fmt$ = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(parseFloat(v) || 0);
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
                api.get("/payments/connect/status").catch(() => null),
            ]);

            const requests = requestRes.data.data.requests || [];
            const bookings = bookingRes.data.data || [];
            const earnings = earningRes.data.data || {};

            const upcomingStatuses = ["accepted", "confirmed", "in_progress"];
            const completedStatuses = ["completed", "finalized"];

            setRecentRequests(requests.slice(0, 3));
            setUpcomingBookings(bookings.filter(b => upcomingStatuses.includes(b.status)).slice(0, 3));
            setStripeStatus(stripeRes?.data?.data ?? null);

            setStats({
                availableRequests: requests.filter(r => ["created", "offers_received"].includes(r.status)).length,
                upcomingBookings: bookings.filter(b => upcomingStatuses.includes(b.status)).length,
                completedSessions: bookings.filter(b => completedStatuses.includes(b.status)).length,
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
    }, []);

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
                    <div className="h-8 bg-slate-200  rounded w-1/4"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200  rounded-xl"></div>)}
                    </div>
                    <div className="h-48 bg-slate-200  rounded-xl"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex justify-between items-center">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 ">Dashboard</h2>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button className="p-2 text-slate-500 hover:text-primary  transition-colors rounded-lg hover:bg-slate-100 ">
                            <MdNotifications className="text-xl" />
                        </button>
                        <Link href="/therapist/profile" className="hover:opacity-90 transition-opacity shrink-0">
                            <UserAvatar
                                name={fullName}
                                photoUrl={profilePhotoUrl}
                                size="md"
                                className="border border-primary/20"
                            />
                        </Link>
                    </div>
                </header>

                {/* Payout account setup banner — only show when status resolved AND not connected */}
                {stripeStatus !== null && !stripeStatus?.connected && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50   p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-3">
                            <MdWarning className="text-amber-600  text-xl shrink-0" />
                            <div>
                                <p className="text-slate-900  font-bold text-sm sm:text-base leading-tight">Set up your payout account to receive earnings.</p>
                                <p className="text-amber-800  text-xs sm:text-sm mt-1">Action required to enable automated earnings transfers to your bank.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/therapist/onboarding/stripe')}
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shrink-0 w-full sm:w-auto justify-center"
                        >
                            Set Up Payouts <MdArrowForward className="text-lg" />
                        </button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                    <Link href="/therapist/requests" className="bg-card-light  border border-border-light  rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-blue-500">
                                <MdNearMe className="text-xl text-white" />
                            </div>
                            <MdArrowForward className="text-slate-300  text-lg mt-0.5" />
                        </div>
                        <p className="text-2xl font-bold text-text-main ">{stats.availableRequests}</p>
                        <p className="text-sm text-text-muted  mt-0.5">Open Requests</p>
                    </Link>
                    <Link href="/therapist/bookings" className="bg-card-light  border border-border-light  rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-amber-500">
                                <MdPendingActions className="text-xl text-white" />
                            </div>
                            <MdArrowForward className="text-slate-300  text-lg mt-0.5" />
                        </div>
                        <p className="text-2xl font-bold text-text-main ">{stats.upcomingBookings}</p>
                        <p className="text-sm text-text-muted  mt-0.5">Upcoming Bookings</p>
                    </Link>
                    <Link href="/therapist/bookings" className="bg-card-light  border border-border-light  rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500">
                                <MdCheckCircle className="text-xl text-white" />
                            </div>
                            <MdArrowForward className="text-slate-300  text-lg mt-0.5" />
                        </div>
                        <p className="text-2xl font-bold text-text-main ">{stats.completedSessions}</p>
                        <p className="text-sm text-text-muted  mt-0.5">Completed Sessions</p>
                    </Link>
                    <Link href="/therapist/earnings" className="bg-card-light  border border-border-light  rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-purple-500">
                                <MdCalendarToday className="text-xl text-white" />
                            </div>
                            <MdArrowForward className="text-slate-300  text-lg mt-0.5" />
                        </div>
                        <p className="text-2xl font-bold text-text-main ">{fmt$(stats.totalEarnings)}</p>
                        <p className="text-sm text-text-muted  mt-0.5">Total Earnings</p>
                    </Link>
                </div>

                {/* Sections */}
                <div className="space-y-6 sm:space-y-8">

                    {/* Nearby Requests */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-lg font-bold text-slate-900 ">Nearby Requests</h3>
                            <Link href="/therapist/requests" className="text-sm text-primary font-semibold hover:underline">View all</Link>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200  bg-white  shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 ">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Service Type</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Location</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Posted</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center"># Offers</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 ">
                                    {recentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 ">No requests available nearby</td>
                                        </tr>
                                    ) : recentRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-slate-50  transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 ">{req.serviceType}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 ">{req.location}</span>
                                                    <span className="text-xs text-slate-500">Nearby</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 ">
                                                {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-slate-100  px-2.5 py-1 rounded text-xs font-bold text-slate-700 ">
                                                    {req.offers?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => router.push(`/therapist/requests/${req.id}`)}
                                                    className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                                >
                                                    View &amp; Offer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden space-y-3">
                            {recentRequests.length === 0 ? (
                                <div className="bg-white  border border-slate-200  rounded-xl p-6 text-center">
                                    <p className="text-slate-500  text-sm">No requests available nearby</p>
                                </div>
                            ) : recentRequests.map(req => (
                                <div
                                    key={req.id}
                                    onClick={() => router.push(`/therapist/requests/${req.id}`)}
                                    className="bg-white  border border-slate-200  rounded-xl p-4 active:bg-slate-50  cursor-pointer"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="font-semibold text-sm text-slate-900 ">{req.serviceType}</h4>
                                        <span className="bg-slate-100  px-2 py-0.5 rounded text-[10px] font-bold text-slate-600  shrink-0">
                                            {req.offers?.length || 0} offer{(req.offers?.length || 0) !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 ">
                                        <span className="flex items-center gap-1">
                                            <MdLocationOn className="text-sm" />
                                            {req.location || 'Nearby'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MdCalendarToday className="text-sm" />
                                            {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Flexible'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Upcoming Bookings */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-end">
                            <h3 className="text-lg font-bold text-slate-900 ">My Upcoming Bookings</h3>
                            <Link href="/therapist/bookings" className="text-sm text-primary font-semibold hover:underline">View history</Link>
                        </div>

                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200  bg-white  shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 ">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Homehealth Agency</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Rate</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 ">
                                    {upcomingBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 ">No upcoming bookings</td>
                                        </tr>
                                    ) : upcomingBookings.map(booking => (
                                        <tr key={booking.id} className="hover:bg-slate-50  transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 ">{booking.customer?.agencyName || booking.customer?.fullName || '—'}</td>
                                            <td className="px-6 py-4 text-slate-700 ">{booking.patient?.fullName || '—'}</td>
                                            <td className="px-6 py-4 font-mono text-primary font-medium">
                                                ${booking.payment?.therapistPayout || (booking.rate * 0.9).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700 ">
                                                {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800   border border-blue-200/50">
                                                    Confirmed
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => router.push(`/therapist/bookings/${booking.id}`)}
                                                    className="text-primary  hover:underline transition-colors text-sm font-bold"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden space-y-3">
                            {upcomingBookings.length === 0 ? (
                                <div className="bg-white  border border-slate-200  rounded-xl p-6 text-center">
                                    <p className="text-slate-500  text-sm">No upcoming bookings</p>
                                </div>
                            ) : upcomingBookings.map(booking => (
                                <div
                                    key={booking.id}
                                    onClick={() => router.push(`/therapist/bookings/${booking.id}`)}
                                    className="bg-white  border border-slate-200  rounded-xl p-4 active:bg-slate-50  cursor-pointer"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="font-semibold text-sm text-slate-900 ">{booking.customer?.agencyName || booking.customer?.fullName || '—'}</h4>
                                        <span className="font-mono text-sm font-bold text-primary shrink-0">
                                            ${booking.payment?.therapistPayout || (booking.rate * 0.9).toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500  mb-2">{booking.patient?.fullName || '—'}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500  flex items-center gap-1">
                                            <MdCalendarToday className="text-sm" />
                                            {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                                        </span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800  ">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}