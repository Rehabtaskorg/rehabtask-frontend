"use client";

import UserAvatar from "../ui/UserAvatar";
import StarRating from "./StarRating";
import { REVIEW_CATEGORIES } from "@/lib/constants";

const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
};

export default function ReviewCard({ review }) {
    if (!review) return null;

    const customerName = review.customer?.fullName || "Anonymous";
    const hasBreakdown = REVIEW_CATEGORIES.every((category) => review[category.field] != null);

    return (
        <div className="border-b border-border-light  pb-6 last:border-0 last:pb-0">
            {/* Top row */}
            <div className="flex items-start gap-3 mb-2">
                <UserAvatar name={customerName} photoUrl={null} size="sm" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-bold text-text-main ">
                            {customerName}
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-text-muted ">
                            {timeAgo(review.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {hasBreakdown && (
                <dl className="ml-11 mb-3 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1.5">
                    {REVIEW_CATEGORIES.map((category) => (
                        <div key={category.field} className="flex items-center justify-between sm:block">
                            <dt className="text-xs text-text-muted ">
                                {category.label}
                            </dt>
                            <dd className="flex items-center gap-1.5">
                                <StarRating rating={review[category.field]} size="sm" />
                                <span className="text-xs text-text-muted ">
                                    {review[category.field]}/5
                                </span>
                            </dd>
                        </div>
                    ))}
                </dl>
            )}

            {/* Comment */}
            {review.comment && (
                <p className="text-sm text-text-muted  leading-relaxed ml-11">
                    {review.comment}
                </p>
            )}
        </div>
    )
}