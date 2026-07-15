"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MdCalendarMonth, MdSearch, MdWarning, MdChevronRight, MdCalendarToday, MdChevronLeft, MdRefresh } from "react-icons/md";
import { useTherapistBookings } from "@/hooks/useBookings";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";
import { formatCurrency } from "@/utils/messages";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import LockedPageOverlay from "@/components/therapist/LockedPageOverlay";
import PatientBadge from "@/components/shared/patient/PatientBadge";

const ITEMS_PER_PAGE = 10;

const FILTER_TABS = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
];

const isUpcoming = (status) =>
    ["pending", "accepted", "confirmed", "in_progress", "reschedule_requested"].includes(status);

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};

export default function TherapistBookingsPage() {
    const { canAccessMarketplace } = useTherapistAccess();
    if (!canAccessMarketplace) return <LockedPageOverlay pageType="bookings" />;
    return <TherapistBookingsContent />;
}

function TherapistBookingsContent() {
    usePageTitle("My Bookings");
    const router = useRouter();
    const { bookings, loading, error, refetch } = useTherapistBookings();
    const [activeFilter, setActiveFilter] = useState("all");
    const [page, setPage] = useState(1);

    // Alert: any booking ready to complete
    const readyToComplete = useMemo(
        () => bookings.some((b) => b.status === "confirmed" && b.sessions?.[0]?.status === "scheduled"),
        [bookings]
    );

    // Counts
    const counts = useMemo(() => ({
        all: bookings.length,
        upcoming: bookings.filter((b) => isUpcoming(b.status)).length,
        completed: bookings.filter((b) => b.status === "completed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }), [bookings]);

    // Filter + paginate
    const filtered = useMemo(() => {
        if (activeFilter === "upcoming") return bookings.filter((b) => isUpcoming(b.status));
        if (activeFilter === "completed") return bookings.filter((b) => b.status === "completed");
        if (activeFilter === "cancelled") return bookings.filter((b) => b.status === "cancelled");
        return bookings;
    }, [bookings, activeFilter]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const handleFilterChange = (key) => {
        setActiveFilter(key);
        setPage(1);
    };

    const handleRowClick = (id) => {
        router.push(`/therapist/bookings/${id}`);
    };

    const getEarnings = (booking) => {
        if (booking.payment?.therapistPayout) return parseFloat(booking.payment.therapistPayout);
        return null;
    };

    // ─── Loading ────
    if (loading) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
                        My Bookings
                    </h2>
                </header>
                <div className="p-4 sm:p-6 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-card-light  border border-border-light  rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    // ─── Error ────
    if (error) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center px-4 sm:px-8 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">My Bookings</h2>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <p className="text-text-muted  text-sm">Failed to load bookings.</p>
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
            {/* Sticky Header */}
            <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center justify-between px-4 sm:px-8 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
                    My Bookings
                </h2>
                <button
                    onClick={() => router.push("/therapist/requests")}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <MdSearch className="text-lg" />
                    <span className="hidden sm:inline">Browse Requests</span>
                </button>
            </header>

            {/* Ready to complete banner */}
            {readyToComplete && (
                <div className="mx-4 sm:mx-8 mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50  border border-amber-200 ">
                    <MdWarning className="text-amber-600  text-lg shrink-0" />
                    <p className="text-sm text-amber-800  flex-1">
                        You have a session ready to be marked complete.
                    </p>
                    <button
                        onClick={() => {
                            const b = bookings.find((b) => b.status === "confirmed" && b.sessions?.[0]?.status === "scheduled");
                            if (b) router.push(`/therapist/bookings/${b.id}`);
                        }}
                        className="text-xs font-bold text-amber-700  hover:underline whitespace-nowrap"
                    >
                        View Booking
                    </button>
                </div>
            )}

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
                            <MdCalendarMonth className="text-5xl text-slate-200  mx-auto" />
                            <p className="text-text-muted  text-sm">
                                {bookings.length === 0 ? "No bookings yet." : "No bookings match this filter."}
                            </p>
                            {bookings.length === 0 && (
                                <button onClick={() => router.push("/therapist/requests")} className="text-primary hover:underline text-sm font-bold">
                                    Browse Requests
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── Desktop Table ── */}
                        <div className="hidden lg:block px-8 py-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-text-muted  border-b border-border-light ">
                                        <th className="pb-3 pr-4">Customer</th>
                                        <th className="pb-3 pr-4">Service</th>
                                        <th className="pb-3 pr-4">Date & Time</th>
                                        <th className="pb-3 pr-4">Earnings / Rate</th>
                                        <th className="pb-3 pr-4">Status</th>
                                        <th className="pb-3 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((booking) => {
                                        const customer = booking.customer;
                                        const initial = customer?.fullName?.charAt(0) || "?";
                                        const earnings = getEarnings(booking);
                                        return (
                                            <tr
                                                key={booking.id}
                                                onClick={() => handleRowClick(booking.id)}
                                                className="border-b border-border-light  hover:bg-slate-50  cursor-pointer transition-colors"
                                            >
                                                <td className="py-3.5 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                            {initial}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-text-main  truncate">
                                                                {customer?.fullName || "Customer"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-sm text-text-main ">
                                                            {booking.offer?.request?.serviceType || "—"}
                                                        </span>
                                                        <PatientBadge patient={booking.patient} />
                                                    </div>
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <p className="text-sm text-text-main ">
                                                        {formatDate(booking.scheduledDate)}
                                                    </p>
                                                    <p className="text-xs text-text-muted ">
                                                        {formatTime(booking.scheduledDate)}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <span className="text-sm font-bold text-emerald-600  font-mono">
                                                        {earnings != null ? formatCurrency(earnings) : <>{formatCurrency(parseFloat(booking.rate))} <span className="text-xs font-normal text-text-muted ">(rate)</span></>}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 pr-4">
                                                    <BookingStatusBadge status={booking.status} />
                                                </td>
                                                <td className="py-3.5">
                                                    <MdChevronRight className="text-lg text-text-muted " />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="lg:hidden space-y-2 p-4">
                            {paginated.map((booking) => {
                                const customer = booking.customer;
                                const initial = customer?.fullName?.charAt(0) || "?";
                                const earnings = getEarnings(booking);
                                return (
                                    <button
                                        key={booking.id}
                                        onClick={() => handleRowClick(booking.id)}
                                        className="w-full text-left p-4 rounded-xl border border-border-light  bg-card-light  hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0">
                                                {initial}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="text-sm font-bold text-text-main  truncate">
                                                        {customer?.fullName || "Customer"}
                                                    </h3>
                                                    <BookingStatusBadge status={booking.status} />
                                                </div>
                                                <p className="text-xs text-text-muted  mb-2">
                                                    {booking.offer?.request?.serviceType || "—"}
                                                </p>
                                                <PatientBadge patient={booking.patient} />
                                                <div className="flex items-center gap-4 text-xs text-text-muted ">
                                                    <span className="flex items-center gap-1">
                                                        <MdCalendarToday className="text-sm" />
                                                        {formatDate(booking.scheduledDate)}
                                                    </span>
                                                    <span className="font-bold text-emerald-600  font-mono">
                                                        {earnings != null ? formatCurrency(earnings) : <>{formatCurrency(parseFloat(booking.rate))} <span className="font-normal text-text-muted ">(rate)</span></>}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
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