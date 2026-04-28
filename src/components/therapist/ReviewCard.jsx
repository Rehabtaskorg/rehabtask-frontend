"use client";

import UserAvatar from "../ui/UserAvatar";
import StarRating from "./StarRating";

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

    return (
        <div className="border-b border-border-light dark:border-border-dark pb-6 last:border-0 last:pb-0">
            {/* Top row */}
            <div className="flex items-start gap-3 mb-2">
                <UserAvatar name={customerName} photoUrl={null} size="sm" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-bold text-text-main dark:text-white">
                            {customerName}
                        </span>
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-text-muted dark:text-gray-400">
                            {timeAgo(review.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Comment */}
            {review.comment && (
                <p className="text-sm text-text-muted dark:text-gray-400 leading-relaxed ml-11">
                    {review.comment}
                </p>
            )}
        </div>
    )
}