"use client";

import Link from "next/link";
import { MdLocationOn, MdCalendarToday } from "react-icons/md";

/**
 * Renders the Nearby Requests section on the therapist dashboard.
 * Shows up to 3 available public requests within the therapist's work area.
 *
 * @param {{ requests: Array<object>, onViewRequest: (id: string) => void }} props
 */
export function NearbyRequestsTable({ requests, onViewRequest }) {
    return (
        <section className="space-y-4">
            <div className="flex justify-between items-end">
                <h3 className="text-lg font-bold text-slate-900">Nearby Requests</h3>
                <Link href="/therapist/requests" className="text-sm text-primary font-semibold hover:underline">
                    View all
                </Link>
            </div>

            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Service Type</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Location</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Date</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Posted</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center"># Offers</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No requests available nearby
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{req.serviceType}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900">{req.location}</span>
                                            <span className="text-xs text-slate-500">Nearby</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {req.preferredDate
                                            ? new Date(req.preferredDate).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {req.createdAt
                                            ? new Date(req.createdAt).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-slate-100 px-2.5 py-1 rounded text-xs font-bold text-slate-700">
                                            {req.offers?.length || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onViewRequest(req.id)}
                                            className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            View &amp; Offer
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="sm:hidden space-y-3">
                {requests.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                        <p className="text-slate-500 text-sm">No requests available nearby</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <div
                            key={req.id}
                            onClick={() => onViewRequest(req.id)}
                            className="bg-white border border-slate-200 rounded-xl p-4 active:bg-slate-50 cursor-pointer"
                        >
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-sm text-slate-900">{req.serviceType}</h4>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 shrink-0">
                                    {req.offers?.length || 0} offer{(req.offers?.length || 0) !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <MdLocationOn className="text-sm" />
                                    {req.location || "Nearby"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MdCalendarToday className="text-sm" />
                                    {req.preferredDate
                                        ? new Date(req.preferredDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                        : "Flexible"}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
