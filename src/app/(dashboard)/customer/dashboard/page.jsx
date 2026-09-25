"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
    MdWarning, MdClose, MdAssignment, MdArrowForward,
    MdEvent, MdSchedule, MdCheckCircle, MdPayments,
} from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useRefundSummary } from "@/hooks/usePayments";
import { BOOKING_STATUS, REQUEST_STATUS } from "@/lib/constants";
import { SubscriptionWidget } from "@/components/customer/dashboard/SubscriptionWidget";
import { CancelledBookingsWidget } from "@/components/customer/dashboard/CancelledBookingsWidget";
import { RecentRequestsTable } from "@/components/customer/dashboard/RecentRequestsTable";
import { UpcomingBookingsTable } from "@/components/customer/dashboard/UpcomingBookingsTable";
import { PendingConfirmationsPanel } from "@/components/customer/dashboard/PendingConfirmationsPanel";

const UPCOMING_STATUSES = [
    BOOKING_STATUS.PENDING_PAYMENT,
    BOOKING_STATUS.ACCEPTED,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.IN_PROGRESS,
];

const ACTIVE_REQUEST_STATUSES = [REQUEST_STATUS.CREATED, REQUEST_STATUS.OFFERS_RECEIVED];

export default function CustomerDashboard() {
    usePageTitle("Dashboard");
    const router = useRouter();

    const [stats, setStats] = useState({
        activeRequests: 0,
        upcomingBookings: 0,
        completedSessions: 0,
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [cancelledBookings, setCancelledBookings] = useState([]);
    const [pendingConfirmations, setPendingConfirmations] = useState([]);
    const [alertDismissed, setAlertDismissed] = useState(false);
    const [refundBannerDismissed, setRefundBannerDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    const { data: refundSummary } = useRefundSummary();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [requestRes, bookingRes] = await Promise.all([
                    api.get("/requests/my-requests"),
                    api.get("/bookings/customer"),
                ]);

                const requests = Array.isArray(requestRes.data.data?.requests) ? requestRes.data.data.requests : [];
                const bookings = Array.isArray(bookingRes.data.data) ? bookingRes.data.data : [];

                const pendingSessions = [];
                for (const booking of bookings) {
                    const totalSessions = booking.sessions?.length || 1;
                    for (const session of booking.sessions || []) {
                        if (session.status === "completed_by_therapist") {
                            pendingSessions.push({
                                sessionId: session.id,
                                sessionNumber: session.sessionNumber,
                                totalSessions,
                                completedAt: session.completedAt || session.updatedAt,
                                bookingId: booking.id,
                                therapistName: booking.therapist?.fullName || "Therapist",
                                serviceType: booking.offer?.request?.serviceType || booking.serviceType || "Session",
                                scheduledDate: booking.scheduledDate,
                            });
                        }
                    }
                }

                setRecentRequests(requests.slice(0, 3));
                setUpcomingBookings(
                    bookings.filter((b) => UPCOMING_STATUSES.includes(b.status)).slice(0, 3)
                );
                setCancelledBookings(
                    bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED).slice(0, 3)
                );
                setPendingConfirmations(pendingSessions);

                setStats({
                    activeRequests: requests.filter((r) => ACTIVE_REQUEST_STATUSES.includes(r.status)).length,
                    upcomingBookings: bookings.filter((b) => UPCOMING_STATUSES.includes(b.status)).length,
                    completedSessions: bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED).length,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="p-4 sm:p-8">
                <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
                    <div className="h-16 bg-slate-200 rounded-xl" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
                        ))}
                    </div>
                    <div className="h-64 bg-slate-200 rounded-xl" />
                </div>
            </div>
        );
    }

    const nowMs = Date.now();

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {!alertDismissed && pendingConfirmations.length > 0 && (
                    <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <MdWarning className="text-amber-600 text-xl shrink-0" />
                            <div className="text-sm">
                                <span className="font-bold text-amber-900">Sessions Awaiting Your Confirmation.</span>
                                <span className="text-amber-700 ml-1">You have sessions that will automatically release payment in 2 days.</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setAlertDismissed(true)}
                            className="text-amber-600 hover:text-amber-700 p-1 rounded"
                            aria-label="Dismiss alert"
                        >
                            <MdClose className="text-lg" />
                        </button>
                    </div>
                )}

                {!refundBannerDismissed && refundSummary?.pendingRefundAmount > 0 && (
                    <div className="flex items-center justify-between p-4 border border-primary/30 bg-primary/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <MdPayments className="text-primary text-xl shrink-0" />
                            <div className="text-sm">
                                <span className="font-bold text-text-main">
                                    You have ${parseFloat(refundSummary.pendingRefundAmount).toFixed(2)} in pending credits.
                                </span>
                                <span className="text-text-muted ml-1">Set up your payout account to receive them.</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Link href="/customer/payments" className="text-primary text-sm font-bold hover:underline">
                                View
                            </Link>
                            <button
                                onClick={() => setRefundBannerDismissed(true)}
                                className="text-text-muted hover:text-text-main p-1 rounded"
                                aria-label="Dismiss refund banner"
                            >
                                <MdClose className="text-lg" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                    <StatCard
                        icon={<MdAssignment className="text-xl text-white" />}
                        iconBg="bg-amber-500"
                        value={stats.activeRequests}
                        label="Open Requests"
                        onClick={() => router.push("/customer/requests")}
                    />
                    <StatCard
                        icon={<MdEvent className="text-xl text-white" />}
                        iconBg="bg-blue-500"
                        value={stats.upcomingBookings}
                        label="Upcoming Sessions"
                        onClick={() => router.push("/customer/bookings")}
                    />
                    <StatCard
                        icon={<MdSchedule className="text-xl text-white" />}
                        iconBg="bg-orange-500"
                        value={pendingConfirmations.length}
                        label="Pending Confirmations"
                        onClick={() => router.push("/customer/bookings")}
                    />
                    <StatCard
                        icon={<MdCheckCircle className="text-xl text-white" />}
                        iconBg="bg-emerald-500"
                        value={stats.completedSessions}
                        label="Total Completed"
                        onClick={() => router.push("/customer/bookings")}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <RecentRequestsTable
                            requests={recentRequests}
                            onViewRequest={(id) => router.push(`/customer/requests/${id}`)}
                        />
                        <UpcomingBookingsTable
                            bookings={upcomingBookings}
                            onViewBooking={(id) => router.push(`/customer/bookings/${id}`)}
                        />
                        <CancelledBookingsWidget
                            cancelledBookings={cancelledBookings}
                            partyLabel="Therapist"
                            bookingsHref="/customer/bookings"
                            onViewBooking={(id) => router.push(`/customer/bookings/${id}`)}
                        />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <PendingConfirmationsPanel
                            pendingConfirmations={pendingConfirmations}
                            nowMs={nowMs}
                            onViewBooking={(id) => router.push(`/customer/bookings/${id}`)}
                        />
                        <SubscriptionWidget />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * @param {{ icon: React.ReactNode, iconBg: string, value: number, label: string, onClick: () => void }} props
 */
function StatCard({ icon, iconBg, value, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-card-light border border-border-light rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all text-left"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
                <MdArrowForward className="text-slate-300 text-lg mt-0.5" />
            </div>
            <p className="text-2xl font-bold text-text-main">{value}</p>
            <p className="text-sm text-text-muted mt-0.5">{label}</p>
        </button>
    );
}

