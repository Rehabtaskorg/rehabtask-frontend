"use client";

export default function TherapistPriceMarker({ rate, isActive = false, onClick }) {
    const label = rate ? `$${rate}` : "—";
    const classes = isActive
        ? "bg-primary text-white border-white shadow-primary/40"
        : "bg-white text-text-main border-white/70 shadow-slate-900/20 hover:bg-primary hover:text-white";

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            className={`font-bold text-xs px-3 py-1.5 rounded-full border-2 shadow-lg transition-all duration-150 hover:scale-110 ${classes}`}
        >
            {label}
        </button>
    );
}
