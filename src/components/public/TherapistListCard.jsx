"use client";

import { motion } from "framer-motion";
import { MdStar, MdLocationOn, MdWorkHistory, MdLock, MdVerified } from "react-icons/md";
import UserAvatar from "@/components/ui/UserAvatar";

export default function TherapistListCard({
    therapist,
    index = 0,
    isHighlighted = false,
    onHover,
    onSelect,
    onAuthGate,
    cardRef,
}) {
    const borderClass = isHighlighted
        ? "border-2 border-primary shadow-lg shadow-primary/10"
        : "border border-border-light hover:border-primary/30 hover:shadow-md";

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25) }}
            onMouseEnter={() => onHover?.(therapist.id)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(therapist.id)}
            onBlur={() => onHover?.(null)}
            onClick={() => onSelect?.(therapist.id)}
            className={`bg-card-light rounded-xl p-4 sm:p-5 transition-all cursor-pointer ${borderClass}`}
        >
            <div className="flex gap-4">
                <UserAvatar
                    name={therapist.fullName || therapist.licenseType || "Therapist"}
                    photoUrl={therapist.photoUrl}
                    size="xl"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-text-main truncate">
                                {therapist.fullName}
                            </h3>
                            <span className="inline-flex items-center gap-1 mt-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                <MdVerified className="text-xs" />
                                {therapist.licenseType || "Licensed"}
                            </span>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-lg font-extrabold text-primary whitespace-nowrap">
                                {therapist.rate ? `$${therapist.rate}` : "—"}
                            </p>
                            {therapist.rate > 0 && (
                                <p className="text-[10px] text-text-muted">per visit</p>
                            )}
                        </div>
                    </div>

                    {therapist.specialization && (
                        <p className="text-xs sm:text-sm text-text-muted mt-2 line-clamp-1">
                            {therapist.specialization}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-text-muted">
                        {therapist.experience > 0 && (
                            <span className="flex items-center gap-1">
                                <MdWorkHistory className="text-sm text-text-muted/70" />
                                {therapist.experience}y exp
                            </span>
                        )}
                        {therapist.location && (
                            <span className="flex items-center gap-1">
                                <MdLocationOn className="text-sm text-text-muted/70" />
                                {therapist.location}
                            </span>
                        )}
                        {therapist.reviewCount > 0 && (
                            <span className="flex items-center gap-1 font-semibold text-amber-500">
                                <MdStar className="text-sm" />
                                {therapist.rating} ({therapist.reviewCount})
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <a
                            href={`/therapists/${therapist.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="py-2 rounded-lg border border-border-light font-semibold text-xs text-text-main hover:bg-muted-light transition-colors text-center"
                        >
                            View Profile
                        </a>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAuthGate?.("message");
                            }}
                            className="py-2 rounded-lg bg-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
                        >
                            <MdLock className="text-xs" />
                            Message
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
