"use client";

import { motion } from "framer-motion";
import { MdStar, MdLocationOn, MdWorkHistory, MdVerified, MdChatBubble } from "react-icons/md";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/ui/UserAvatar";
import { useMessageGuard } from "@/hooks/useMessageGuard";
import { MessageGateModal } from "@/components/ui/MessageGateModal";

export default function FindTherapistsListCard({
    therapist,
    index = 0,
    isHighlighted = false,
    onHover,
    onSelect,
    cardRef,
}) {
    const router = useRouter();
    const { guardedHandleMessage, isGateOpen, closeGate, gateProps } = useMessageGuard();

    const borderClass = isHighlighted
        ? "border-2 border-primary shadow-lg shadow-primary/10"
        : "border border-border-light  hover:border-primary/30 hover:shadow-md";

    const handleMessage = (e) => {
        e.stopPropagation();
        guardedHandleMessage(therapist.userId);
    };

    const handleViewProfile = (e) => {
        e.stopPropagation();
        router.push(`/customer/find-therapists/${therapist.id}`);
    };

    return (
        <>
        <MessageGateModal isOpen={isGateOpen} onClose={closeGate} {...gateProps} />
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
            className={`bg-card-light  rounded-xl p-4 transition-all cursor-pointer ${borderClass}`}
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
                            <h3 className="text-sm font-bold text-text-main  truncate">
                                {therapist.fullName}
                            </h3>
                            <span className="inline-flex items-center gap-1 mt-1 bg-emerald-50  text-emerald-700  text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                <MdVerified className="text-[11px]" />
                                {therapist.licenseType || "Licensed"}
                            </span>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-lg font-extrabold text-primary whitespace-nowrap leading-tight">
                                {therapist.rate ? `$${therapist.rate}` : "—"}
                            </p>
                            {therapist.rate > 0 && (
                                <p className="text-[10px] text-text-muted ">per visit</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-text-muted ">
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

                    <div className="flex items-center justify-end gap-3 mt-3">
                        <button
                            type="button"
                            onClick={handleViewProfile}
                            className="text-xs font-semibold text-text-muted  hover:text-primary transition-colors"
                        >
                            View Profile
                        </button>
                        <button
                            type="button"
                            onClick={handleMessage}
                            className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
                        >
                            <MdChatBubble className="text-xs" />
                            Message
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
        </>
    );
}
