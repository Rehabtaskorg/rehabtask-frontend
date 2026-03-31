"use client";

import { motion } from "framer-motion";
import { MdSchedule, MdLocationOn, MdCalendarToday, MdGroups, MdLock } from "react-icons/md";

const SERVICE_COLORS = {
    "Physical Therapy": "bg-blue-50 text-blue-700 border-blue-200",
    "Occupational Therapy": "bg-purple-50 text-purple-700 border-purple-200",
    "Speech Language Pathology (SLP)": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
}

function formatDate(dateStr) {
    if (!dateStr) return "Flexible";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RequestPublicCard({ request, index = 0, onAuthGate }) {
    const colorClass = SERVICE_COLORS[request.serviceType] || "bg-gray-50 text-gray-700 border-gray-200";

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#137fec]/30 hover:shadow-md transition-all"
        >
            {/* Top row */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${colorClass}`}>
                        {request.serviceType}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                        <MdSchedule className="text-sm" /> {timeAgo(request.createdAt)}
                    </span>
                </div>
                {request.visitType && (
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                        {request.visitType}
                    </span>
                )}
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">{request.description}</p>

            {/* Details grid */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-100 mb-5">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Location</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <MdLocationOn className="text-xs text-gray-400" /> {request.locationCity}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Schedule</p>
                    <p className="text-sm font-semibold text-gray-900">
                        {request.visitsPerWeek ? `${request.visitsPerWeek}x / week` : "Flexible"}
                        {request.numberOfWeeks ? ` · ${request.numberOfWeeks}wk` : ""}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Start Date</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <MdCalendarToday className="text-xs text-gray-400" /> {formatDate(request.preferredDate)}
                    </p>
                </div>
            </div>

            {/* Blurred customer identity */}
            <div
                className="flex items-center gap-3 mb-5 bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onAuthGate("contact")}
            >
                <div className="flex items-center gap-2 blur-[4px] select-none flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <span className="text-sm font-medium text-gray-400">Customer Name</span>
                </div>
                <MdLock className="text-gray-400 text-sm" />
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                    <MdGroups className="text-sm" /> {request.offerCount} Offer{request.offerCount !== 1 ? "s" : ""} sent
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onAuthGate("offer")}
                        className="flex items-center gap-1.5 bg-[#137fec] text-white font-semibold text-xs px-5 py-2.5 rounded-lg hover:bg-[#137fec]/90 transition-colors"
                    >
                        <MdLock className="text-xs" /> Send Offer
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
