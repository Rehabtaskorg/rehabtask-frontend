"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
    MdWarning, MdClose, MdAssignment,
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

            setRecentRequests(requests.slice(0, 3));
            setUpcomingBookings(bookings.filter(b => b.status === "confirmed").slice(0, 3));
            setPendingConfirmations(bookings.filter(b => b.status === "pending_confirmation").slice(0, 3));

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
        <div className="p-4 sm:p-8 space-y-6">

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onClick={() => router.push('/customer/requests')} className="bg-white dark:bg-card-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 shrink-0">
                        <MdAssignment className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Open Requests</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeRequests}</p>
                    </div>
                </button>
                <button onClick={() => router.push('/customer/bookings')} className="bg-white dark:bg-card-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 shrink-0">
                        <MdEvent className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Sessions</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.upcomingBookings}</p>
                    </div>
                </button>
                <button onClick={() => router.push('/customer/bookings')} className="bg-white dark:bg-card-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 shrink-0">
                        <MdSchedule className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Confirmations</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{pendingConfirmations.length}</p>
                    </div>
                </button>
                <button onClick={() => router.push('/customer/bookings')} className="bg-white dark:bg-card-dark p-5 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 shrink-0">
                        <MdCheckCircle className="text-2xl" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Completed</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.completedSessions}</p>
                    </div>
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
                                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{booking.serviceType || '—'}</td>
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
                            <div className="flex items-center gap-2">
                                <MdWarning className="text-amber-600 text-lg" />
                                <h4 className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider text-xs">Pending Confirmation</h4>
                            </div>
                        </div>
                        <div className="p-6">
                            {pendingConfirmations.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No sessions pending confirmation</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingConfirmations.map(booking => (
                                        <div key={booking.id} className="p-4 rounded-xl border border-slate-200 dark:border-border-dark space-y-4">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-slate-100">{booking.therapist?.fullName || 'Therapist'}</p>
                                                <p className="text-xs text-slate-500">{booking.serviceType} • {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : '—'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors">
                                                    Confirm Completion
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/customer/disputes/new?bookingId=${booking.id}`)}
                                                    className="w-full border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-xs py-2.5 rounded-lg transition-colors"
                                                >
                                                    Dispute
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl flex items-start gap-3">
                                <MdInfo className="text-slate-400 text-lg shrink-0" />
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    If no action is taken within 48 hours, the session will be automatically confirmed and payment released.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <SubscriptionWidget />
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