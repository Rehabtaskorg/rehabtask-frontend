"use client";

import { useState } from "react";
import {
    MdCheckCircle, MdRadioButtonUnchecked, MdTimer, MdCancel,
    MdCalendarToday, MdSchedule, MdTaskAlt, MdWarning
} from "react-icons/md";

const STATUS_CONFIG = {
    pending_schedule: { icon: MdSchedule, color: "text-slate-400", bg: "bg-slate-100 dark:bg-slate-800", label: "Pending Schedule" },
    scheduled: { icon: MdCalendarToday, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Scheduled" },
    completed_by_therapist: { icon: MdTimer, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Awaiting Confirmation" },
    confirmed_by_customer: { icon: MdCheckCircle, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", label: "Confirmed" },
    cancelled: { icon: MdCancel, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Cancelled" },
};

const formatDate = (dateStr) => {
    if (!dateStr) return "Not scheduled";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export default function SessionList({
    sessions = [],
    role,
    onMarkComplete,
    onConfirm,
    onSchedule,
    completing,
    confirming,
    scheduling,
}) {
    const [scheduleSessionId, setScheduleSessionId] = useState(null);
    const [scheduleDate, setScheduleDate] = useState("");

    if (!sessions || sessions.length <= 1) return null;

    const totalSessions = sessions.length;
    const confirmedCount = sessions.filter(s => s.status === "confirmed_by_customer").length;
    const progressPercent = totalSessions > 0 ? Math.round((confirmedCount / totalSessions) * 100) : 0;

    const todayStr = new Date().toISOString().slice(0, 16);

    const handleScheduleSubmit = (sessionId) => {
        if (!scheduleDate) return;
        onSchedule?.(sessionId, new Date(scheduleDate).toISOString());
        setScheduleSessionId(null);
        setScheduleDate("");
    };

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
            {/* Header with progress */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-text-main dark:text-white flex items-center gap-2">
                    <MdTaskAlt className="text-primary text-lg" />
                    Treatment Plan
                </h3>
                <span className="text-sm font-semibold text-text-muted dark:text-slate-400">
                    {confirmedCount} of {totalSessions} completed
                </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-5">
                <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Session rows */}
            <div className="space-y-3">
                {sessions.map((session) => {
                    const config = STATUS_CONFIG[session.status] || STATUS_CONFIG.pending_schedule;
                    const StatusIcon = config.icon;
                    const isSchedulable = role === "therapist" && session.status === "pending_schedule";
                    const isCompletable = role === "therapist" && session.status === "scheduled";
                    const isConfirmable = role === "customer" && session.status === "completed_by_therapist";

                    return (
                        <div
                            key={session.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                                session.status === "confirmed_by_customer"
                                    ? "border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10"
                                    : "border-border-light dark:border-border-dark"
                            }`}
                        >
                            {/* Status icon */}
                            <StatusIcon className={`text-xl flex-shrink-0 ${config.color}`} />

                            {/* Session info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-text-main dark:text-white">
                                        Session {session.sessionNumber}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                                        {config.label}
                                    </span>
                                </div>
                                <p className="text-xs text-text-muted dark:text-slate-400 mt-0.5">
                                    {session.scheduledDate ? `${formatDate(session.scheduledDate)} · ${formatTime(session.scheduledDate)}` : "Date not set"}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0">
                                {isSchedulable && scheduleSessionId !== session.id && (
                                    <button
                                        onClick={() => setScheduleSessionId(session.id)}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        Schedule
                                    </button>
                                )}

                                {isSchedulable && scheduleSessionId === session.id && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="datetime-local"
                                            min={todayStr}
                                            value={scheduleDate}
                                            onChange={(e) => setScheduleDate(e.target.value)}
                                            className="text-xs bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark rounded px-2 py-1"
                                        />
                                        <button
                                            onClick={() => handleScheduleSubmit(session.id)}
                                            disabled={!scheduleDate || scheduling}
                                            className="text-xs font-bold text-white bg-primary px-2 py-1 rounded disabled:opacity-50"
                                        >
                                            {scheduling ? "..." : "Set"}
                                        </button>
                                        <button
                                            onClick={() => { setScheduleSessionId(null); setScheduleDate(""); }}
                                            className="text-xs text-text-muted hover:text-red-500"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                {isCompletable && (
                                    <button
                                        onClick={() => onMarkComplete?.(session.id)}
                                        disabled={completing}
                                        className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {completing ? "..." : "Complete"}
                                    </button>
                                )}

                                {isConfirmable && (
                                    <button
                                        onClick={() => onConfirm?.(session.id)}
                                        disabled={confirming}
                                        className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {confirming ? "..." : "Confirm"}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
