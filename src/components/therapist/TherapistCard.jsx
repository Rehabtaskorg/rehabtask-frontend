"use client";

import { MdWork, MdLocationOn, MdVerified, MdAttachMoney } from "react-icons/md";
import UserAvatar from "../ui/UserAvatar";
import StarRating from "./StarRating";

export default function TherapistCard({ therapist, onClick }) {
    if (!therapist) return null;

    const workAreaText = therapist.workAreas
        ?.slice(0, 2)
        .map((wa) => `${wa.city}, ${wa.state}`)
        .join(", ") || "—";

    const tags = [
        therapist.specialization,
        therapist.primaryLicenseType,
    ].filter(Boolean);

    return (
        <div
            onClick={onClick}
            className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
            {/* Top row: avatar + info */}
            <div className="flex items-start gap-4 mb-4">
                <div className="shrink-0 rounded-xl overflow-hidden">
                    <UserAvatar
                        name={therapist.fullName}
                        photoUrl={therapist.profilePhotoUrl}
                        size="lg"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-lg font-bold text-text-main dark:text-white truncate">
                            {therapist.fullName}
                        </h3>
                        <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                            <MdVerified className="text-xs" />
                            Verified
                        </span>
                    </div>
                    <p className="text-sm font-medium text-text-muted dark:text-gray-400 mb-1.5">
                        {therapist.specialization || "Therapist"}
                    </p>
                    <StarRating
                        rating={therapist.averageRating || 0}
                        size="sm"
                        showValue={!!therapist.averageRating}
                        reviewCount={therapist.reviewCount}
                    />
                </div>
            </div>

            {/* Info row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
                    <MdWork className="text-base shrink-0" />
                    <span>{therapist.yearsOfExperience || 0} Years Exp.</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted dark:text-gray-400">
                    <MdLocationOn className="text-base shrink-0" />
                    <span className="truncate">{workAreaText}</span>
                </div>
                {therapist.ratePerVisit && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        <MdAttachMoney className="text-base shrink-0" />
                        <span>${parseFloat(therapist.ratePerVisit).toFixed(2)}/visit</span>
                    </div>
                )}
                {therapist.attemptedVisitRate != null && parseFloat(therapist.attemptedVisitRate) > 0 && (
                    <p className="text-[11px] text-text-muted dark:text-gray-500">
                        Attempted visit fee: ${parseFloat(therapist.attemptedVisitRate).toFixed(2)}
                    </p>
                )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, i) => (
                        <span
                            key={i}
                            className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded text-xs font-medium text-text-main dark:text-white"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* View Profile button */}
            <button
                className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-bold transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onClick) onClick();
                }}
            >
                View Profile
            </button>
        </div>
    )

}