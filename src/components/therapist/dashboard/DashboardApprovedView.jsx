"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { MdNotifications, MdWarning, MdArrowForward, MdNearMe, MdPendingActions, MdCheckCircle, MdCalendarToday } from "react-icons/md";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/ui/UserAvatar";
import { BOOKING_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { NearbyRequestsTable } from "./components/NearbyRequestsTable";
import { TherapistUpcomingBookingsTable } from "./components/TherapistUpcomingBookingsTable";
import { CancelledBookingsWidget } from "@/components/customer/dashboard/CancelledBookingsWidget";

const UPCOMING_STATUSES = [
    BOOKING_STATUS.ACCEPTED,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.IN_PROGRESS,
];

const COMPLETED_STATUSES = [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.FINALIZED];

const fmt$ = (v) =>
    v == null ? "—" : Number(v).toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function DashboardApprovedView() {
    const { user } = useAuth();
    const profilePhotoUrl = user?.profile?.profilePhotoUrl;
    const fullName = user?.profile?.fullName || "";
    const router = useRouter();

    const [stats, setStats] = useState({
        availableRequests: 0,
        upcomingBookings: 0,
        completedSessions: 0,
        totalEarnings: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [cancelledBookings, setCancelledBookings] = useState([]);
    const [stripeStatus, setStripeStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

                setRecentRequests(requests.slice(0, 3));
                setUpcomingBookings(
                    bookings.filter((b) => UPCOMING_STATUSES.includes(b.status)).slice(0, 3)
                );
                setCancelledBookings(
                    bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED).slice(0, 3)
                );
                setStripeStatus(stripeRes?.data?.data ?? null);

                setStats({
                    availableRequests: requests.filter((r) =>
                        ["created", "offers_received"].includes(r.status)
                    ).length,
                    upcomingBookings: bookings.filter((b) => UPCOMING_STATUSES.includes(b.status)).length,
                    completedSessions: bookings.filter((b) => COMPLETED_STATUSES.includes(b.status)).length,
                    totalEarnings: earnings.totalEarnings || 0,
                });
            } catch (err) {
                logger.error("[TherapistDashboard] Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="p-4 md:p-6">
                <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
                    <div className="h-8 bg-slate-200 rounded w-1/4" />
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
                        ))}
                    </div>
                    <div className="h-48 bg-slate-200 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                <header className="flex justify-between items-center">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            className="p-2 text-slate-500 hover:text-primary transition-colors rounded-lg hover:bg-slate-100"
                            aria-label="Notifications"
                        >
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

                {stripeStatus !== null && !stripeStatus?.connected && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-3">
                            <MdWarning className="text-amber-600 text-xl shrink-0" />
                            <div>
                                <p className="text-slate-900 font-bold text-sm sm:text-base leading-tight">
                                    Set up your payout account to receive earnings.
                                </p>
                                <p className="text-amber-800 text-xs sm:text-sm mt-1">
                                    Action required to enable automated earnings transfers to your bank.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/therapist/payouts")}
                            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shrink-0 w-full sm:w-auto justify-center"
                        >
                            Set Up Payouts <MdArrowForward className="text-lg" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                    <Link href="/therapist/requests" className="bg-card-light border border-border-light rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-blue-500">
                                <MdNearMe className="text-xl text-white" />
                            </div>
                            <MdArrowForward className="text-slate-300 text-lg mt-0.5" />
                        </div>
                        <p className="text-2xl font-bold text-text-main">{stats.availableRequests}</p>
                        <p className="text-sm text-text-muted mt-0.5">Open Requests</p>
                    </Link>
                    <Link href="/therapist/bookings" className="bg-card-light border border-border-light rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-amber-500">
                                <MdPendingActions className="text-xl text-white" />
                            </div>
                            <MdArrowForward className="text-slate-300 text-lg mt-0.5" />
                        </div>
                        <p className="text-2xl font-bold text-text-main">{stats.upcomingBookings}</p>
                        <p className="text-sm text-text-muted mt-0.5">Upcoming Bookings</p>
                    </Link>
                    <Link href="/therapist/bookings" className="bg-card-light border border-border-light rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500">
                                <MdCheckCircle className="text-xl text-white" />
                            </div>
                            <MdArrowForward className="text-slate-300 text-lg mt-0.5" />
                        </div>
                        <p className="text-2xl font-bold text-text-main">{stats.completedSessions}</p>
                        <p className="text-sm text-text-muted mt-0.5">Completed Sessions</p>
                    </Link>
                    <Link href="/therapist/earnings" className="bg-card-light border border-border-light rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-xl bg-purple-500">
                                <MdCalendarToday className="text-xl text-white" />
                            </div>
                            <MdArrowForward className="text-slate-300 text-lg mt-0.5" />
                        </div>
                        <p className="text-2xl font-bold text-text-main">{fmt$(stats.totalEarnings)}</p>
                        <p className="text-sm text-text-muted mt-0.5">Total Earnings</p>
                    </Link>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    <NearbyRequestsTable
                        requests={recentRequests}
                        onViewRequest={(id) => router.push(`/therapist/requests/${id}`)}
                    />
                    <TherapistUpcomingBookingsTable
                        bookings={upcomingBookings}
                        onViewBooking={(id) => router.push(`/therapist/bookings/${id}`)}
                    />
                    <CancelledBookingsWidget
                        cancelledBookings={cancelledBookings}
                        partyLabel="Customer"
                        bookingsHref="/therapist/bookings"
                        onViewBooking={(id) => router.push(`/therapist/bookings/${id}`)}
                    />
                </div>
            </div>
        </div>
    );
}
