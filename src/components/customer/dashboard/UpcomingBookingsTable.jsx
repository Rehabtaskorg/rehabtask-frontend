"use client";

import Link from "next/link";

/**
 * Renders the Upcoming Bookings table on the customer dashboard.
 * Shows up to 3 bookings in accepted/confirmed/in_progress states.
 *
 * @param {{ bookings: Array<object>, onViewBooking: (id: string) => void }} props
 */
export function UpcomingBookingsTable({ bookings, onViewBooking }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-bold text-lg text-slate-900">Upcoming Bookings</h4>
                <Link href="/customer/bookings" className="text-sm font-semibold text-primary hover:underline">
                    View All
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-primary/5 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Therapist</th>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Service Type</th>
                            <th className="px-6 py-4">Date &amp; Time</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No upcoming bookings
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        {booking.therapist?.fullName || "—"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {booking.patient?.fullName || "Self"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {booking.offer?.request?.serviceType || booking.serviceType || "—"}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {booking.scheduledDate
                                            ? new Date(booking.scheduledDate).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                                            Confirmed
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onViewBooking(booking.id)}
                                            className="text-primary font-bold hover:underline cursor-pointer"
                                        >
                                            View Booking
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
