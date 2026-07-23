"use client";

import Link from "next/link";
import { MdCalendarToday } from "react-icons/md";
import { CUSTOMER_TYPES } from "@/lib/constants";

/**
 * @param {object} [customer]
 * @returns {string}
 */
const getCustomerTypeLabel = (customer) =>
    customer?.customerType === CUSTOMER_TYPES.AGENCY ? "Homehealth Agency" : "Individual";

/**
 * @param {object} booking
 * @returns {string}
 */
const getPatientName = (booking) =>
    booking.patient?.fullName || booking.customer?.fullName || "—";

/**
 * Renders the Upcoming Bookings section on the therapist dashboard.
 * Shows up to 3 bookings in accepted/confirmed/in_progress states.
 *
 * @param {{ bookings: Array<object>, onViewBooking: (id: string) => void }} props
 */
export function TherapistUpcomingBookingsTable({ bookings, onViewBooking }) {
    return (
        <section className="space-y-4">
            <div className="flex justify-between items-end">
                <h3 className="text-lg font-bold text-slate-900">My Upcoming Bookings</h3>
                <Link href="/therapist/bookings" className="text-sm text-primary font-semibold hover:underline">
                    View history
                </Link>
            </div>

            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Rate</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Date</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
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
                                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        {getCustomerTypeLabel(booking.customer)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{getPatientName(booking)}</td>
                                    <td className="px-6 py-4 font-mono text-primary font-medium">
                                        ${booking.payment?.therapistPayout || (booking.rate * 0.9).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {booking.scheduledDate
                                            ? new Date(booking.scheduledDate).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200/50">
                                            Confirmed
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onViewBooking(booking.id)}
                                            className="text-primary hover:underline transition-colors text-sm font-bold"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="sm:hidden space-y-3">
                {bookings.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                        <p className="text-slate-500 text-sm">No upcoming bookings</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div
                            key={booking.id}
                            onClick={() => onViewBooking(booking.id)}
                            className="bg-white border border-slate-200 rounded-xl p-4 active:bg-slate-50 cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-slate-900">
                                    {getCustomerTypeLabel(booking.customer)}
                                </h4>
                                <span className="font-mono text-sm font-bold text-primary shrink-0">
                                    ${booking.payment?.therapistPayout || (booking.rate * 0.9).toFixed(2)}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mb-2">{getPatientName(booking)}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <MdCalendarToday className="text-sm" />
                                    {booking.scheduledDate
                                        ? new Date(booking.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                        : "—"}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                                    Confirmed
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
