"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    MdGavel, MdAdd, MdChevronRight, MdChevronLeft,
    MdRefresh, MdCalendarToday,
} from "react-icons/md";
import { useMyDisputes } from "@/hooks/useDisputes";
import { usePageTitle } from "@/hooks/usePageTitle";

const ITEMS_PER_PAGE = 10;

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

const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "under_review", label: "Under Review" },
    { key: "resolved", label: "Resolved" },
    { key: "closed", label: "Closed" },
];

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
            {status?.replace(/_/g, " ")}
        </span>
    );
}

function TypeBadge({ type }) {
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap ${TYPE_STYLES[type] ?? TYPE_STYLES.other}`}>
            {type?.replace(/_/g, " ") || "Other"}
        </span>
    );
}

export default function CustomerDisputesPage() {
    usePageTitle("My Disputes");
    const router = useRouter();
    const { disputes, loading, error, refetch } = useMyDisputes();
    const [activeFilter, setActiveFilter] = useState("all");
    const [page, setPage] = useState(1);

    const counts = useMemo(() => ({
        all: disputes.length,
        open: disputes.filter((d) => d.status === "open").length,
        under_review: disputes.filter((d) => d.status === "under_review").length,
        resolved: disputes.filter((d) => d.status === "resolved").length,
        closed: disputes.filter((d) => d.status === "closed").length,
    }), [disputes]);

    const filtered = useMemo(() => {
        if (activeFilter === "all") return disputes;
        return disputes.filter((d) => d.status === activeFilter);
    }, [disputes, activeFilter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleFilterChange = (key) => {
        setActiveFilter(key);
        setPage(1);
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">My Disputes</h2>
                </header>
                <div className="p-4 sm:p-6 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-card-light  border border-border-light  rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center px-4 sm:px-8 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">My Disputes</h2>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <p className="text-text-muted  text-sm">Failed to load disputes.</p>
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
            <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center justify-between px-4 sm:px-8 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">My Disputes</h2>
                <button
                    onClick={() => router.push("/customer/disputes/new")}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <MdAdd className="text-lg" />
                    <span className="hidden sm:inline">File Dispute</span>
                </button>
            </header>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 px-4 sm:px-8 py-3 border-b border-border-light  shrink-0">
                {FILTER_TABS.map((tab) => {
                    const isActive = activeFilter === tab.key;
                    const count = counts[tab.key];
                    return (
                        <button
                            key={tab.key}
                            onClick={() => handleFilterChange(tab.key)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive
                                ? "bg-primary text-white"
                                : "bg-slate-100  text-slate-600  hover:bg-slate-200 "
                                }`}
                        >
                            {tab.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center py-16">
                        <div className="text-center space-y-3">
                            <MdGavel className="text-5xl text-slate-200  mx-auto" />
                            <p className="text-text-muted  text-sm">
                                {disputes.length === 0
                                    ? "You haven\u2019t filed any disputes yet."
                                    : "No disputes match this filter."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block px-8 py-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-text-muted  border-b border-border-light ">
                                        <th className="pb-3 pr-4">Ticket</th>
                                        <th className="pb-3 pr-4">Type</th>
                                        <th className="pb-3 pr-4">Description</th>
                                        <th className="pb-3 pr-4">Status</th>
                                        <th className="pb-3 pr-4">Date Filed</th>
                                        <th className="pb-3 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((dispute) => (
                                        <tr
                                            key={dispute.id}
                                            onClick={() => router.push(`/customer/disputes/${dispute.id}`)}
                                            className="border-b border-border-light  hover:bg-slate-50  cursor-pointer transition-colors"
                                        >
                                            <td className="py-3.5 pr-4">
                                                <span className="font-mono text-xs text-text-muted ">
                                                    #{dispute.ticketId}
                                                </span>
                                            </td>
                                            <td className="py-3.5 pr-4">
                                                <TypeBadge type={dispute.type} />
                                            </td>
                                            <td className="py-3.5 pr-4">
                                                <p className="text-sm text-text-main  truncate max-w-80">
                                                    {dispute.description}
                                                </p>
                                            </td>
                                            <td className="py-3.5 pr-4">
                                                <StatusBadge status={dispute.status} />
                                            </td>
                                            <td className="py-3.5 pr-4">
                                                <span className="text-sm text-text-muted ">
                                                    {fmtDate(dispute.createdAt)}
                                                </span>
                                            </td>
                                            <td className="py-3.5">
                                                <MdChevronRight className="text-lg text-text-muted " />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-2 p-4">
                            {paginated.map((dispute) => (
                                <button
                                    key={dispute.id}
                                    onClick={() => router.push(`/customer/disputes/${dispute.id}`)}
                                    className="w-full text-left p-4 rounded-xl border border-border-light  bg-card-light  hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <span className="font-mono text-xs text-text-muted ">
                                            #{dispute.ticketId}
                                        </span>
                                        <StatusBadge status={dispute.status} />
                                    </div>
                                    <p className="text-sm font-medium text-text-main  line-clamp-2 mb-2">
                                        {dispute.description}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-text-muted ">
                                        <TypeBadge type={dispute.type} />
                                        <span className="flex items-center gap-1">
                                            <MdCalendarToday className="text-sm" />
                                            {fmtDate(dispute.createdAt)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-t border-border-light ">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 text-sm font-medium text-text-muted  hover:text-text-main  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <MdChevronLeft className="text-lg" /> Previous
                                </button>
                                <span className="text-xs text-text-muted ">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 text-sm font-medium text-text-muted  hover:text-text-main  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next <MdChevronRight className="text-lg" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
