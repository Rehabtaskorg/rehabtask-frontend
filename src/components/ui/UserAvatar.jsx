"use client";

import { useState } from "react";
import Image from "next/image";

const getInitials = (name) => {
    if (!name) return "?";
    return name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
};

/**
 * Avatar component with profile photo support and initials fallback
 * 
 * @param {string} name - Display name (used for initial fallback & alt text)
 * @param {string} [photoUrl] - Profile photo URL (optional)
 * @param {"xs"|"sm"|"md"|"lg"|"xl"}  [size="md"] - Preset size
 * @param {string} [className] - Additional classes on the outer wrapper
 * @param {boolean} [showOnlineIndicator] - Show a green presence dot (bottom-right)
 */
export default function UserAvatar({ name, photoUrl, size = "md", className = "", showOnlineIndicator = false }) {
    const [imgError, setImgError] = useState(false);

    const sizeMap = {
        xs: { container: "h-7 w-7", text: "text-[10px]" },
        sm: { container: "h-8 w-8", text: "text-xs" },
        md: { container: "h-10 w-10", text: "text-sm" },
        lg: { container: "h-12 w-12", text: "text-sm" },
        xl: { container: "h-24 w-24", text: "text-2xl" },
        "2xl": { container: "h-20 w-20", text: "text-2xl" },
        "3xl": { container: "h-[120px] w-[120px]", text: "text-4xl" },
    };

    const indicatorSizeMap = {
        xs: "h-2 w-2 border",
        sm: "h-2.5 w-2.5 border",
        md: "h-3 w-3 border-2",
        lg: "h-3 w-3 border-2",
        xl: "h-4 w-4 border-2",
        "2xl": "h-4 w-4 border-2",
        "3xl": "h-5 w-5 border-2",
    };

    const { container: containerClasses, text: textClasses } = sizeMap[size] || sizeMap.md;
    const indicatorClasses = indicatorSizeMap[size] || indicatorSizeMap.md;
    const initials = getInitials(name);
    const showPhoto = photoUrl && !imgError;

    return (
        <div className={`relative shrink-0 ${className}`}>
            {showPhoto ? (
                <div className={`${containerClasses} relative rounded-full overflow-hidden`}>
                    <Image
                        src={photoUrl}
                        alt={name || "User avatar"}
                        fill
                        sizes="(max-width: 768px) 40px, 96px"
                        onError={() => setImgError(true)}
                        className="object-cover"
                    />
                </div>
            ) : (
                <div
                    className={`${containerClasses} rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold ${textClasses}`}
                >
                    {initials}
                </div>
            )}

            {showOnlineIndicator && (
                <span
                    className={`absolute bottom-0 right-0 ${indicatorClasses} rounded-full bg-green-500 border-white dark:border-card-dark`}
                />
            )}
        </div>
    )

}