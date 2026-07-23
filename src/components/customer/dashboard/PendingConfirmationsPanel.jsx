"use client";

import Link from "next/link";
import { MdWarning, MdInfo } from "react-icons/md";

/**
 * Sidebar panel listing sessions that the customer still needs to confirm.
 * Each row shows therapist name, session number, and a countdown to auto-release.
 * Mounts regardless of count — shows an empty state when there are none.
 *
 * @param {{
 *   pendingConfirmations: Array<object>,
 *   nowMs: number,
 *   onViewBooking: (id: string) => void
 * }} props
 */
export function PendingConfirmationsPanel({ pendingConfirmations, nowMs, onViewBooking }) {
    return (
        <div className="bg-white border border-amber-500/30 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 bg-amber-50 border-b border-amber-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MdWarning className="text-amber-600 text-lg" />
                        <h4 className="font-bold text-amber-900 uppercase tracking-wider text-xs">
                            Pending Confirmation
                        </h4>
                    </div>
                    {pendingConfirmations.length > 0 && (
                        <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                            {pendingConfirmations.length}
                        </span>
                    )}
                </div>
            </div>
            <div className="p-4">
                {pendingConfirmations.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                        No sessions pending confirmation
                    </p>
                ) : (
                    <div className="space-y-3">
                        {pendingConfirmations.slice(0, 5).map((item) => {
                            const hoursAgo = item.completedAt
                                ? Math.floor((nowMs - new Date(item.completedAt).getTime()) / (1000 * 60 * 60))
                                : null;
                            const hoursLeft = hoursAgo !== null ? Math.max(0, 72 - hoursAgo) : null;

                            return (
                                <button
                                    key={item.sessionId}
                                    onClick={() => onViewBooking(item.bookingId)}
                                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all text-left"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <p className="font-bold text-sm text-slate-900 truncate">
                                            {item.therapistName}
                                        </p>
                                        {hoursLeft !== null && (
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                                    hoursLeft <= 24
                                                        ? "bg-red-100 text-red-600"
                                                        : "bg-amber-100 text-amber-600"
                                                }`}
                                            >
                                                {hoursLeft}h left
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {item.totalSessions > 1
                                            ? `Visit ${item.sessionNumber} of ${item.totalSessions} • `
                                            : ""}
                                        {item.serviceType}
                                    </p>
                                </button>
                            );
                        })}
                        {pendingConfirmations.length > 5 && (
                            <Link
                                href="/customer/bookings"
                                className="block text-center text-xs font-semibold text-primary hover:underline py-2"
                            >
                                View all {pendingConfirmations.length} pending sessions
                            </Link>
                        )}
                    </div>
                )}
                <div className="mt-3 bg-slate-50 p-3 rounded-xl flex items-start gap-2">
                    <MdInfo className="text-slate-400 text-sm shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Sessions auto-confirm after 72 hours and payment is released to the therapist.
                    </p>
                </div>
            </div>
        </div>
    );
}
