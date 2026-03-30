"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MdStar, MdLocationOn, MdWorkHistory, MdLock, MdVerified } from "react-icons/md";

export default function TherapistPublicCard({ therapist, index = 0, onAuthGate }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#137fec]/20 transition-all group"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <Image
                    src={therapist.photo}
                    alt={therapist.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                />
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <MdVerified className="text-xs" />
                    {therapist.licenseType}
                </span>
            </div>

            {/* Info */}
            <h4 className="text-lg font-bold text-gray-900">{therapist.name}</h4>
            <p className="text-sm text-gray-500 mt-0.5">{therapist.specialization}</p>

            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MdWorkHistory className="text-sm text-gray-400" />
                    <span>{therapist.experience} years experience</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MdLocationOn className="text-sm text-gray-400" />
                    <span>{therapist.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    <MdStar className="text-sm text-amber-500" />
                    <span className="text-gray-900">{therapist.rating}</span>
                    <span className="text-gray-400">({therapist.reviewCount} reviews)</span>
                </div>
            </div>

            {/* Rate */}
            <div className="mt-4 mb-5">
                <span className="text-xl font-extrabold text-gray-900">${therapist.rate}</span>
                <span className="text-sm text-gray-500">/visit</span>
            </div>

            {/* Blurred contact */}
            <div
                className="relative rounded-lg overflow-hidden bg-gray-50 p-3 mb-5 cursor-pointer"
                onClick={() => onAuthGate("contact")}
            >
                <div className="blur-sm select-none opacity-40">
                    <p className="text-[10px] text-gray-600">+1 (555) ***-****</p>
                    <p className="text-[10px] text-gray-600">****@****.com</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#137fec]">
                        <MdLock className="text-xs" /> Sign up to see contact details
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => onAuthGate("profile")}
                    className="py-2.5 rounded-lg border border-gray-200 font-semibold text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    View Profile
                </button>
                <button
                    onClick={() => onAuthGate("message")}
                    className="py-2.5 rounded-lg bg-[#137fec] text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#137fec]/90 transition-colors"
                >
                    <MdLock className="text-xs" /> Message
                </button>
            </div>
        </motion.div>
    );
}
