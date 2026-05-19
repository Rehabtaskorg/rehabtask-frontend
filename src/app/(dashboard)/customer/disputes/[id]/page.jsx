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
    open: "bg-blue-100 text-blue-700  ",
    under_review: "bg-purple-100 text-purple-700  ",
    resolved: "bg-emerald-100 text-emerald-700  ",
    closed: "bg-slate-100 text-slate-600  ",
};

const TYPE_STYLES = {
    billing: "bg-amber-100 text-amber-700  ",
    service_quality: "bg-rose-100 text-rose-700  ",
    no_show: "bg-red-100 text-red-700  ",
    communication: "bg-cyan-100 text-cyan-700  ",
    other: "bg-slate-100 text-slate-600  ",
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
                <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center gap-3 px-4 sm:px-8 shrink-0">
                    <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100  text-slate-500">
                        <MdArrowBack className="text-xl" />
                    </button>
                    <h2 className="text-xl font-black text-text-main ">Dispute Details</h2>
                </header>
                <div className="p-4 sm:p-8 space-y-4 max-w-3xl mx-auto w-full">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-card-light  border border-border-light  rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !dispute) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center gap-3 px-4 sm:px-8 shrink-0">
                    <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100  text-slate-500">
                        <MdArrowBack className="text-xl" />
                    </button>
                    <h2 className="text-xl font-black text-text-main ">Dispute Details</h2>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <p className="text-text-muted  text-sm">
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
            <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center gap-3 px-4 sm:px-8 shrink-0">
                <button
                    onClick={() => router.push("/customer/disputes")}
                    className="p-2 rounded-lg hover:bg-slate-100  text-slate-500  transition-colors"
                >
                    <MdArrowBack className="text-xl" />
                </button>
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight text-text-main  truncate">
                        Dispute #{dispute.ticketId}
                    </h2>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-5">

                    {/* Status card */}
                    <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <StatusBadge status={dispute.status} />
                            <TypeBadge type={dispute.type} />
                        </div>
                        <p className="text-sm text-text-muted ">
                            {STATUS_DESCRIPTIONS[dispute.status] || ""}
                        </p>
                    </div>

                    {/* Details grid */}
                    <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-main  mb-4">Details</h3>
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold text-text-muted  uppercase tracking-wide mb-1">Ticket ID</dt>
                                <dd className="text-sm font-mono text-text-main ">#{dispute.ticketId}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-text-muted  uppercase tracking-wide mb-1">Date Filed</dt>
                                <dd className="text-sm text-text-main  flex items-center gap-1.5">
                                    <MdCalendarToday className="text-text-muted text-xs" />
                                    {fmtDateTime(dispute.createdAt)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-text-muted  uppercase tracking-wide mb-1">Type</dt>
                                <dd><TypeBadge type={dispute.type} /></dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-text-muted  uppercase tracking-wide mb-1">Assigned To</dt>
                                <dd className="text-sm text-text-main  flex items-center gap-1.5">
                                    <MdPerson className="text-text-muted text-xs" />
                                    {dispute.assignedAdmin?.email || (
                                        <span className="text-text-muted  italic">Pending assignment</span>
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Related booking */}
                    {dispute.booking && (
                        <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                            <h3 className="text-sm font-bold text-text-main  mb-3">Related Booking</h3>
                            <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-sm text-text-main ">
                                        {dispute.booking.sessionType || "Session"} — {fmtDate(dispute.booking.scheduledDate)}
                                    </p>
                                    <p className="text-xs text-text-muted  capitalize">
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
                    <div className="bg-card-light  border border-border-light  rounded-xl p-5">
                        <h3 className="text-sm font-bold text-text-main  mb-3">Description</h3>
                        <p className="text-sm text-text-main  leading-relaxed whitespace-pre-wrap">
                            {dispute.description}
                        </p>
                    </div>

                    {/* Resolution */}
                    {dispute.resolution && (
                        <div className="bg-emerald-50  border border-emerald-200  rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <MdCheckCircle className="text-emerald-600 " />
                                <h3 className="text-sm font-bold text-emerald-800 ">Resolution</h3>
                            </div>
                            <p className="text-sm text-emerald-900  leading-relaxed whitespace-pre-wrap">
                                {dispute.resolution}
                            </p>
                            {dispute.resolvedAt && (
                                <p className="text-xs text-emerald-700  mt-3">
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
