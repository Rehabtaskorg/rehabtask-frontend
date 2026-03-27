"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
    MdWarning, MdClose, MdAssignment, MdArrowForward,
    MdEvent, MdSchedule, MdCheckCircle, MdInfo, MdStars, MdAccessTime
} from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSubscription } from "@/hooks/useSubscription";

const STATUS_STYLES = {
    created: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    offers_received: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    offers_accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_LABELS = {
    created: 'Created',
    offers_received: 'Offers Received',
    offers_accepted: 'Accepted',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export default function CustomerDashboard() {
    usePageTitle("Dashboard");
    const router = useRouter();
    const [stats, setStats] = useState({
        activeRequests: 0,
        upcomingBookings: 0,
        completedSessions: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [pendingConfirmations, setPendingConfirmations] = useState([]);
    const [alertDismissed, setAlertDismissed] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [requestRes, bookingRes] = await Promise.all([
                api.get("/requests/my-requests"),
                api.get('/bookings/customer'),
            ]);

            const requests = Array.isArray(requestRes.data.data) ? requestRes.data.data : [];
            const bookings = Array.isArray(bookingRes.data.data) ? bookingRes.data.data : [];

            const upcomingStatuses = ["accepted", "confirmed", "in_progress"];

            setRecentRequests(requests.slice(0, 3));
            setUpcomingBookings(bookings.filter(b => upcomingStatuses.includes(b.status)).slice(0, 3));
            const pendingSessions = [];
            for (const b of bookings) {
                const totalSessions = b.sessions?.length || 1;
                for (const s of (b.sessions || [])) {
                    if (s.status === "completed_by_therapist") {
                        pendingSessions.push({
                            sessionId: s.id,
                            sessionNumber: s.sessionNumber,
                            totalSessions,
                            completedAt: s.completedAt || s.updatedAt,
                            bookingId: b.id,
                            therapistName: b.therapist?.fullName || "Therapist",
                            serviceType: b.offer?.request?.serviceType || b.serviceType || "Session",
                            scheduledDate: b.scheduledDate,
                        });
                    }
                }
            }
            setPendingConfirmations(pendingSessions);

            setStats({
                activeRequests: requests.filter(r => ["created", "offers_received"].includes(r.status)).length,
                upcomingBookings: bookings.filter(b => upcomingStatuses.includes(b.status)).length,
                completedSessions: bookings.filter(b => b.status === "completed").length,
            });
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchDashboardData(); }, []);

    if (loading) {
        return (
            <div className="p-4 sm:p-8">
                <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
                    <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>)}
                    </div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

            {/* Alert Banner */}
            {!alertDismissed && pendingConfirmations.length > 0 && (
                <div className="flex items-center justify-between p-4 border border-amber-200 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                    <div className="flex items-center gap-3">
                        <MdWarning className="text-amber-600 text-xl shrink-0" />
                        <div className="text-sm">
                            <span className="font-bold text-amber-900 dark:text-amber-200">Sessions Awaiting Your Confirmation.</span>
                            <span className="text-amber-700 dark:text-amber-300 ml-1">You have sessions that will automatically release payment in 2 days.</span>
                        </div>
                    </div>
                    <button onClick={() => setAlertDismissed(true)} className="text-amber-600 hover:text-amber-700 p-1 rounded">
                        <MdClose className="text-lg" />
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
                <button onClick={() => router.push('/customer/requests')} className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all text-left">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-amber-500">
                            <MdAssignment className="text-xl text-white" />
                        </div>
                        <MdArrowForward className="text-slate-300 dark:text-slate-600 text-lg mt-0.5" />
                    </div>
                    <p className="text-2xl font-bold text-text-main dark:text-white">{stats.activeRequests}</p>
                    <p className="text-sm text-text-muted dark:text-slate-400 mt-0.5">Open Requests</p>
                </button>
                <button onClick={() => router.push('/customer/bookings')} className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all text-left">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-blue-500">
                            <MdEvent className="text-xl text-white" />
                        </div>
                        <MdArrowForward className="text-slate-300 dark:text-slate-600 text-lg mt-0.5" />
                    </div>
                    <p className="text-2xl font-bold text-text-main dark:text-white">{stats.upcomingBookings}</p>
                    <p className="text-sm text-text-muted dark:text-slate-400 mt-0.5">Upcoming Sessions</p>
                </button>
                <button onClick={() => router.push('/customer/bookings')} className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all text-left">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-orange-500">
                            <MdSchedule className="text-xl text-white" />
                        </div>
                        <MdArrowForward className="text-slate-300 dark:text-slate-600 text-lg mt-0.5" />
                    </div>
                    <p className="text-2xl font-bold text-text-main dark:text-white">{pendingConfirmations.length}</p>
                    <p className="text-sm text-text-muted dark:text-slate-400 mt-0.5">Pending Confirmations</p>
                </button>
                <button onClick={() => router.push('/customer/bookings')} className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all text-left">
                    <div className="flex items-start justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500">
                            <MdCheckCircle className="text-xl text-white" />
                        </div>
                        <MdArrowForward className="text-slate-300 dark:text-slate-600 text-lg mt-0.5" />
                    </div>
                    <p className="text-2xl font-bold text-text-main dark:text-white">{stats.completedSessions}</p>
                    <p className="text-sm text-text-muted dark:text-slate-400 mt-0.5">Total Completed</p>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2/3 */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Recent Requests Table */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Recent Requests</h4>
                            <Link href="/customer/requests" className="text-sm font-semibold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-primary/5 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Service Type</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Preferred Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Offers</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                    {recentRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                No requests yet.{' '}
                                                <button onClick={() => router.push('/customer/requests/new')} className="text-primary font-semibold hover:underline">Create your first request</button>
                                            </td>
                                        </tr>
                                    ) : recentRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-primary/5 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{req.serviceType}</td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{req.location}</td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                {req.preferredDate ? new Date(req.preferredDate).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${STATUS_STYLES[req.status] || 'bg-slate-100 text-slate-600'}`}>
                                                    {STATUS_LABELS[req.status] || req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{req.offers?.length || 0}</td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => router.push(`/customer/requests/${req.id}`)} className="text-primary font-bold hover:underline cursor-pointer">View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Upcoming Bookings Table */}
                    <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex items-center justify-between">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Upcoming Bookings</h4>
                            <Link href="/customer/bookings" className="text-sm font-semibold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-primary/5 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Therapist</th>
                                        <th className="px-6 py-4">Service Type</th>
                                        <th className="px-6 py-4">Date &amp; Time</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                                    {upcomingBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No upcoming bookings</td>
                                        </tr>
                                    ) : upcomingBookings.map(booking => (
                                        <tr key={booking.id} className="hover:bg-primary/5 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{booking.therapist?.fullName || '—'}</td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{booking.offer?.request?.serviceType || booking.serviceType || '—'}</td>
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase">Confirmed</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => router.push(`/customer/bookings/${booking.id}`)} className="text-primary font-bold hover:underline cursor-pointer">View Booking</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right 1/3 */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Pending Session Confirmations */}
                    <div className="bg-white dark:bg-card-dark border border-amber-500/30 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-500/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MdWarning className="text-amber-600 text-lg" />
                                    <h4 className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-xs">Pending Confirmation</h4>
                                </div>
                                {pendingConfirmations.length > 0 && (
                                    <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                                        {pendingConfirmations.length}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-4">
                            {pendingConfirmations.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No sessions pending confirmation</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingConfirmations.slice(0, 5).map((item) => {
                                        const hoursAgo = item.completedAt
                                            ? Math.floor((Date.now() - new Date(item.completedAt).getTime()) / (1000 * 60 * 60))
                                            : null;
                                        const hoursLeft = hoursAgo !== null ? Math.max(0, 72 - hoursAgo) : null;

                                        return (
                                            <button
                                                key={item.sessionId}
                                                onClick={() => router.push(`/customer/bookings/${item.bookingId}`)}
                                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-border-dark hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all text-left"
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{item.therapistName}</p>
                                                    {hoursLeft !== null && (
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                                            hoursLeft <= 24
                                                                ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                                                : "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                                                        }`}>
                                                            {hoursLeft}h left
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {item.totalSessions > 1
                                                        ? `Session ${item.sessionNumber} of ${item.totalSessions} • `
                                                        : ""}
                                                    {item.serviceType}
                                                </p>
                                            </button>
                                        );
                                    })}
                                    {pendingConfirmations.length > 5 && (
                                        <Link
                                            href="/customer/bookings"
                                            className="block text-center text-xs font-semibold text-primary hover:underline py-2"
                                        >
                                            View all {pendingConfirmations.length} pending sessions
                                        </Link>
                                    )}
                                </div>
                            )}
                            <div className="mt-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex items-start gap-2">
                                <MdInfo className="text-slate-400 text-sm shrink-0 mt-0.5" />
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                    Sessions auto-confirm after 72 hours and payment is released to the therapist.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <SubscriptionWidget />
                </div>
            </div>
            </div>
        </div>
    )

}

function SubscriptionWidget() {
    const { subscription } = useSubscription();
    const router = useRouter();
    const status = subscription?.status;
    const plan = subscription?.planType || "free";
    const isTrial = status === "trialing";
    const isGrace = status === "grace_period";
    const isFree = plan === "free" && !isTrial;

    const trialDays = isTrial && subscription?.trialEndsAt
        ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0;

    if (isTrial) {
        return (
            <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                        <MdAccessTime className="text-xl" />
                        <h5 className="font-bold text-lg">Free Trial — {trialDays} day{trialDays !== 1 ? "s" : ""} left</h5>
                    </div>
                    <p className="text-white/70 text-sm">Upgrade before your trial ends to keep Standard plan features.</p>
                    <button onClick={() => router.push("/customer/subscription")} className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors">
                        View Plans
                    </button>
                </div>
                <div className="absolute -bottom-8 -right-8 size-32 bg-white/10 rounded-full pointer-events-none" />
            </div>
        );
    }

    if (isGrace) {
        return (
            <div className="bg-amber-500 p-6 rounded-xl text-white relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                        <MdWarning className="text-xl" />
                        <h5 className="font-bold text-lg">Payment Overdue</h5>
                    </div>
                    <p className="text-white/80 text-sm">Update your payment method to avoid being downgraded to Free.</p>
                    <button onClick={() => router.push("/customer/subscription")} className="bg-white text-amber-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors">
                        Update Payment
                    </button>
                </div>
            </div>
        );
    }

    if (isFree) {
        return (
            <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2">
                        <MdStars className="text-xl" />
                        <h5 className="font-bold text-lg">Free Plan</h5>
                    </div>
                    <p className="text-white/70 text-sm">Upgrade to unlock more requests, therapists, and premium features.</p>
                    <button onClick={() => router.push("/customer/subscription")} className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors">
                        Upgrade Plan
                    </button>
                </div>
                <div className="absolute -bottom-8 -right-8 size-32 bg-white/10 rounded-full pointer-events-none" />
            </div>
        );
    }

    // Active paid plan — show current plan info
    return (
        <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden">
            <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                    <MdStars className="text-xl" />
                    <h5 className="font-bold text-lg">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h5>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20">Active</span>
                </div>
                <p className="text-white/70 text-sm">Your subscription is active. Manage your plan and billing settings.</p>
                <button onClick={() => router.push("/customer/subscription")} className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors">
                    Manage Subscription
                </button>
            </div>
            <div className="absolute -bottom-8 -right-8 size-32 bg-white/10 rounded-full pointer-events-none" />
        </div>
    );
}