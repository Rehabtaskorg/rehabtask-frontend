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
            className={`bg-card-light rounded-xl p-3 transition-all cursor-pointer ${borderClass}`}
        >
            <div className="flex gap-3">
                <UserAvatar
                    name={therapist.fullName || therapist.licenseType || "Therapist"}
                    photoUrl={therapist.photoUrl}
                    size="lg"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold text-text-main truncate">
                                {therapist.fullName}
                            </h3>
                            <span className="inline-flex items-center gap-1 mt-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                <MdVerified className="text-[11px]" />
                                {therapist.licenseType || "Licensed"}
                            </span>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-base font-extrabold text-primary whitespace-nowrap leading-tight">
                                {therapist.rate ? `$${therapist.rate}` : "—"}
                            </p>
                            {therapist.rate > 0 && (
                                <p className="text-[9px] text-text-muted">per visit</p>
                            )}
                        </div>
                    </div>

                    {therapist.specialization && (
                        <p className="text-xs text-text-muted mt-1.5 line-clamp-1">
                            {therapist.specialization}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-text-muted">
                        {therapist.experience > 0 && (
                            <span className="flex items-center gap-0.5">
                                <MdWorkHistory className="text-xs text-text-muted/70" />
                                {therapist.experience}y exp
                            </span>
                        )}
                        {therapist.location && (
                            <span className="flex items-center gap-0.5">
                                <MdLocationOn className="text-xs text-text-muted/70" />
                                {therapist.location}
                            </span>
                        )}
                        {therapist.reviewCount > 0 && (
                            <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                                <MdStar className="text-xs" />
                                {therapist.rating} ({therapist.reviewCount})
                            </span>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-2">
                        <a
                            href={`/therapists/${therapist.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-semibold text-text-muted hover:text-primary transition-colors"
                        >
                            View Profile
                        </a>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAuthGate?.("message");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white font-semibold text-[11px] flex items-center gap-1 hover:bg-primary/90 transition-colors"
                        >
                            <MdLock className="text-[10px]" />
                            Message
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
