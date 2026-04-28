"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
    MdArrowBack, MdGavel, MdRefresh, MdCalendarToday,
    MdPerson, MdCheckCircle,
} from "react-icons/md";
import { useDisputeDetail } from "@/hooks/useDisputes";
import { usePageTitle } from "@/hooks/usePageTitle";

const STATUS_STYLES = {
    open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    under_review: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    closed: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const TYPE_STYLES = {
    billing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    service_quality: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    no_show: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    communication: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    other: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const STATUS_DESCRIPTIONS = {
    open: "Your dispute has been submitted and is awaiting review.",
    under_review: "An admin is currently reviewing your dispute.",
    resolved: "This dispute has been resolved.",
    closed: "This dispute has been closed.",
};

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const fmtDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
            {status?.replace(/_/g, " ")}
        </span>
    );
}

function TypeBadge({ type }) {
    return (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${TYPE_STYLES[type] ?? TYPE_STYLES.other}`}>
            {type?.replace(/_/g, " ") || "Other"}
        </span>
    );
}

export default function DisputeDetailPage({ params }) {
    const { id } = use(params);
    usePageTitle("Dispute Details");
    const router = useRouter();
    const { dispute, loading, error, refetch } = useDisputeDetail(id);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center gap-3 px-4 sm:px-8 shrink-0">
                    <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                        <MdArrowBack className="text-xl" />
                    </button>
                    <h2 className="text-xl font-black text-text-main dark:text-white">Dispute Details</h2>
                </header>
                <div className="p-4 sm:p-8 space-y-4 max-w-3xl mx-auto w-full">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !dispute) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center gap-3 px-4 sm:px-8 shrink-0">
                    <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
                        <MdArrowBack className="text-xl" />
                    </button>
                    <h2 className="text-xl font-black text-text-main dark:text-white">Dispute Details</h2>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <p className="text-text-muted dark:text-gray-400 text-sm">
                            {error ? "Failed to load dispute." : "Dispute not found."}
                        </p>
                        <button onClick={refetch} className="text-primary hover:underline text-sm font-bold flex items-center gap-1 mx-auto">
                            <MdRefresh className="text-base" /> Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center gap-3 px-4 sm:px-8 shrink-0">
                <button
                    onClick={() => router.push("/customer/disputes")}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                >
                    <MdArrowBack className="text-xl" />
                </button>
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-text-main dark:text-white truncate">
                        Dispute #{dispute.ticketId}
                    </h2>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-5">

                    {/* Status card */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <StatusBadge status={dispute.status} />
                            <TypeBadge type={dispute.type} />
                        </div>
                        <p className="text-sm text-text-muted dark:text-slate-400">
                            {STATUS_DESCRIPTIONS[dispute.status] || ""}
                        </p>
                    </div>

                    {/* Details grid */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-main dark:text-white mb-4">Details</h3>
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-1">Ticket ID</dt>
                                <dd className="text-sm font-mono text-text-main dark:text-white">#{dispute.ticketId}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-1">Date Filed</dt>
                                <dd className="text-sm text-text-main dark:text-white flex items-center gap-1.5">
                                    <MdCalendarToday className="text-text-muted text-xs" />
                                    {fmtDateTime(dispute.createdAt)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-1">Type</dt>
                                <dd><TypeBadge type={dispute.type} /></dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-text-muted dark:text-slate-400 uppercase tracking-wide mb-1">Assigned To</dt>
                                <dd className="text-sm text-text-main dark:text-white flex items-center gap-1.5">
                                    <MdPerson className="text-text-muted text-xs" />
                                    {dispute.assignedAdmin?.email || (
                                        <span className="text-text-muted dark:text-slate-400 italic">Pending assignment</span>
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Related booking */}
                    {dispute.booking && (
                        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                            <h3 className="text-sm font-bold text-text-main dark:text-white mb-3">Related Booking</h3>
                            <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-sm text-text-main dark:text-white">
                                        {dispute.booking.sessionType || "Session"} — {fmtDate(dispute.booking.scheduledDate)}
                                    </p>
                                    <p className="text-xs text-text-muted dark:text-slate-400 capitalize">
                                        Booking status: {dispute.booking.status?.replace(/_/g, " ")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push(`/customer/bookings/${dispute.booking.id || dispute.bookingId}`)}
                                    className="text-primary hover:text-primary/80 text-sm font-bold whitespace-nowrap transition-colors"
                                >
                                    View Booking
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-main dark:text-white mb-3">Description</h3>
                        <p className="text-sm text-text-main dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {dispute.description}
                        </p>
                    </div>

                    {/* Resolution */}
                    {dispute.resolution && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <MdCheckCircle className="text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Resolution</h3>
                            </div>
                            <p className="text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed whitespace-pre-wrap">
                                {dispute.resolution}
                            </p>
                            {dispute.resolvedAt && (
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-3">
                                    Resolved on {fmtDateTime(dispute.resolvedAt)}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
