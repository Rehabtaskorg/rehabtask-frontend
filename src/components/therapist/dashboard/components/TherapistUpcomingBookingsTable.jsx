"use client";

import Link from "next/link";
import { MdCalendarToday } from "react-icons/md";
import { CUSTOMER_TYPES, LICENSE_TYPE_TO_DISCIPLINE } from "@/lib/constants";
import { PatientIdentityCell } from "@/components/bookings/PatientIdentityCell";
import BookingStatusBadge from "@/components/bookings/BookingStatusBadge";

/**
 * @param {object} booking
 * @returns {string}
 */
const getPatientName = (booking) =>
    booking.patient?.fullName || booking.customer?.fullName || "—";

/**
 * @param {object} booking
 * @returns {string}
 */
const getAgencyName = (booking) => {
    if (booking.customer?.customerType !== CUSTOMER_TYPES.AGENCY) return "—";
    return booking.patient?.agency?.agencyName || booking.customer?.agencyName || "—";
};

/**
 * @param {object} booking
 * @returns {string}
 */
const getEarningsDisplay = (booking) => {
    const payout = booking.payment?.therapistPayout;
    if (payout) return `$${parseFloat(payout).toFixed(2)}`;
    return `$${(parseFloat(booking.rate) * 0.9).toFixed(2)}`;
};

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
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Patient</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Discipline</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Agency</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Date</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Earnings</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                    No upcoming bookings
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => {
                                const therapist = booking.therapist;
                                const discipline = LICENSE_TYPE_TO_DISCIPLINE[therapist?.primaryLicenseType] || "—";
                                return (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <PatientIdentityCell
                                                patient={booking.patient}
                                                customer={booking.customer}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">{discipline}</td>
                                        <td className="px-6 py-4 text-slate-700">{getAgencyName(booking)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">
                                            {booking.scheduledDate
                                                ? new Date(booking.scheduledDate).toLocaleDateString()
                                                : "—"}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-emerald-600 font-medium">
                                            {getEarningsDisplay(booking)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <BookingStatusBadge status={booking.status} />
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
                                );
                            })
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
                    bookings.map((booking) => {
                        const therapist = booking.therapist;
                        const discipline = LICENSE_TYPE_TO_DISCIPLINE[therapist?.primaryLicenseType] || "—";
                        return (
                            <div
                                key={booking.id}
                                onClick={() => onViewBooking(booking.id)}
                                className="bg-white border border-slate-200 rounded-xl p-4 active:bg-slate-50 cursor-pointer"
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-semibold text-sm text-slate-900">{getPatientName(booking)}</h4>
                                    <span className="font-mono text-sm font-bold text-emerald-600 shrink-0">
                                        {getEarningsDisplay(booking)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-1">
                                    {discipline} · {getAgencyName(booking)}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <MdCalendarToday className="text-sm" />
                                        {booking.scheduledDate
                                            ? new Date(booking.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                            : "—"}
                                    </span>
                                    <BookingStatusBadge status={booking.status} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}
