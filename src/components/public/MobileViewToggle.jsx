"use client";

import { MdList, MdMap } from "react-icons/md";

export default function MobileViewToggle({ view, onChange }) {
    const buttonClass = (key) =>
        `flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
            view === key
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted hover:text-text-main"
        }`;

    return (
        <div className="lg:hidden bg-muted-light dark:bg-muted-dark p-1 rounded-xl flex border border-border-light dark:border-border-dark">
            <button type="button" onClick={() => onChange("list")} className={buttonClass("list")}>
                <MdList className="text-base" />
                List
            </button>
            <button type="button" onClick={() => onChange("map")} className={buttonClass("map")}>
                <MdMap className="text-base" />
                Map
            </button>
        </div>
    );
}
