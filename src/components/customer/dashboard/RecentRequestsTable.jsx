"use client";

import Link from "next/link";
import useRequestStore from "@/store/requestStore";

const REQUEST_STATUS_STYLES = {
    created: "bg-blue-100 text-blue-700",
    offers_received: "bg-amber-100 text-amber-700",
    offers_accepted: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
};

const REQUEST_STATUS_LABELS = {
    created: "Created",
    offers_received: "Offers Received",
    offers_accepted: "Accepted",
    completed: "Completed",
    cancelled: "Cancelled",
};

/**
 * Renders the Recent Requests table on the customer dashboard.
 * Shows the 3 most recent requests with status badges and a View action.
 *
 * @param {{ requests: Array<object>, onViewRequest: (id: string) => void }} props
 */
export function RecentRequestsTable({ requests, onViewRequest }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h4 className="font-bold text-lg text-slate-900">Recent Requests</h4>
                <Link href="/customer/requests" className="text-sm font-semibold text-primary hover:underline">
                    View All
                </Link>
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
                    <tbody className="divide-y divide-slate-100">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                    No requests yet.{" "}
                                    <button
                                        onClick={() => {
                                            useRequestStore.persist.clearStorage();
                                            useRequestStore.getState().reset();
                                            window.location.href = "/customer/requests/new";
                                        }}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Create your first request
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className="hover:bg-primary/5 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{req.serviceType}</td>
                                    <td className="px-6 py-4 text-slate-700">{req.location}</td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {req.preferredDate
                                            ? new Date(req.preferredDate).toLocaleDateString()
                                            : "—"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                REQUEST_STATUS_STYLES[req.status] || "bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {REQUEST_STATUS_LABELS[req.status] || req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">{req.offers?.length || 0}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => onViewRequest(req.id)}
                                            className="text-primary font-bold hover:underline cursor-pointer"
                                        >
                                            View
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
