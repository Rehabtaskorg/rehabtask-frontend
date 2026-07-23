"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdCancel } from "react-icons/md";

/**
 * @param {string} dateStr
 * @returns {string}
 */
const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

/**
 * Renders the Recent Cancellations section on a dashboard.
 * Only mounts when there is at least one cancelled booking.
 * Shows up to 3 rows; "View All" links to the role-appropriate bookings page.
 *
 * @param {{
 *   cancelledBookings: Array<object>,
 *   partyLabel?: string,
 *   bookingsHref?: string,
 *   onViewBooking: (id: string) => void,
 * }} props
 */
export function CancelledBookingsWidget({
    cancelledBookings,
    partyLabel = "Therapist",
    bookingsHref = "/customer/bookings",
    onViewBooking,
}) {
    if (!cancelledBookings.length) return null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MdCancel className="text-red-500 text-xl" />
                    <h4 className="font-bold text-lg text-slate-900">Recent Cancellations</h4>
                </div>
                <Link href={bookingsHref} className="text-sm font-semibold text-primary hover:underline">
                    View All
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-red-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">{partyLabel}</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Cancelled On</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {cancelledBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-red-50/40 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-900">
                                    {partyLabel === "Customer"
                                        ? (booking.customer?.fullName || booking.customer?.agencyName || "—")
                                        : (booking.therapist?.fullName || "—")}
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    {booking.offer?.request?.serviceType || booking.serviceType || "—"}
                                </td>
                                <td className="px-6 py-4 text-slate-700">
                                    {formatDate(booking.updatedAt)}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onViewBooking(booking.id)}
                                        className="text-primary font-bold hover:underline cursor-pointer"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
