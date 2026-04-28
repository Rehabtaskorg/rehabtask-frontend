"use client";

const TAIL_COMMON = "after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:-mt-px after:border-l-[6px] after:border-r-[6px] after:border-t-[7px] after:border-l-transparent after:border-r-transparent";

export default function TherapistPriceMarker({ label, isActive = false, onClick }) {
    const primary = label?.primary || "—";
    const suffix = label?.suffix;

    const classes = isActive
        ? "bg-primary text-white border-white shadow-primary/40 after:border-t-primary"
        : "bg-white text-text-main border-white/70 shadow-slate-900/20 hover:bg-primary hover:text-white after:border-t-white hover:after:border-t-primary";

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            className={`relative font-bold text-xs px-3 py-1.5 rounded-full border-2 shadow-lg transition-all duration-150 hover:scale-110 whitespace-nowrap ${TAIL_COMMON} ${classes}`}
        >
            {primary}
            {suffix && <span className="ml-1 opacity-80 font-semibold">{suffix}</span>}
        </button>
    );
}
