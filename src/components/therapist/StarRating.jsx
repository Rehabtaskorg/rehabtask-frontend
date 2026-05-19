"use client";

import { useState } from "react";
import { MdStar, MdStarBorder, MdStarHalf } from "react-icons/md";

const SIZE_CLASSES = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
};

export default function StarRating({
    rating = 0,
    size = "md",
    interactive = false,
    onChange,
    showValue = false,
    reviewCount,
}) {
    const [hoverValue, setHoverValue] = useState(0);

    const displayRating = interactive && hoverValue > 0 ? hoverValue : rating;
    const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

    const handleClick = (value) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    const renderStar = (index) => {
        const starValue = index + 1;
        const filled = displayRating >= starValue;
        const halfFilled = !filled && displayRating >= starValue - 0.5;

        let StarIcon;
        if (filled) {
            StarIcon = MdStar;
        } else if (halfFilled && !interactive) {
            StarIcon = MdStarHalf;
        } else {
            StarIcon = MdStarBorder;
        }

        return (
            <button
                key={index}
                type="button"
                className={`text-yellow-400 ${sizeClass} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"
                    }`}
                onClick={() => handleClick(starValue)}
                onMouseEnter={() => interactive && setHoverValue(starValue)}
                onMouseLeave={() => interactive && setHoverValue(0)}
                disabled={!interactive}
                aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            >
                <StarIcon />
            </button>
        )

    }

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center">
                {[0, 1, 2, 3, 4].map(renderStar)}
            </div>
            {showValue && rating > 0 && (
                <span className="text-sm font-bold text-text-main  ml-1">
                    {Number(rating).toFixed(1)}
                </span>
            )}
            {reviewCount != null && (
                <span className="text-xs text-text-muted  ml-0.5">
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
            )}
            {!showValue && rating === 0 && reviewCount == null && !interactive && (
                <span className="text-xs text-text-muted  ml-1">
                    No reviews yet
                </span>
            )}
        </div>
    )

}