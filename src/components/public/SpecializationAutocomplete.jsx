"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MdSearch } from "react-icons/md";
import { SPECIALIZATIONS } from "@/lib/constants/specializations";

const SUGGESTIONS = SPECIALIZATIONS.filter((s) => s !== "Other");

const VARIANTS = {
    compact: {
        wrapper: "flex-1 flex items-center bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-w-0",
        input: "bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm",
        icon: "text-gray-400 text-lg mr-2 shrink-0",
    },
    stacked: {
        wrapper: "flex items-center bg-white px-4 py-4 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all",
        input: "bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm",
        icon: "text-gray-400 text-xl mr-3 shrink-0",
    },
};

export default function SpecializationAutocomplete({
    value,
    onChange,
    placeholder = "Specialization or keyword",
    variant = "compact",
}) {
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef(null);

    const variantClasses = VARIANTS[variant] || VARIANTS.compact;

    const filtered = useMemo(() => {
        const query = (value || "").trim().toLowerCase();
        if (!query) return SUGGESTIONS;
        return SUGGESTIONS.filter((s) => s.toLowerCase().includes(query));
    }, [value]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleSelect = (suggestion) => {
        onChange(suggestion);
        setOpen(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            setOpen(true);
            return;
        }
        if (!open || filtered.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
        } else if (e.key === "Enter") {
            if (activeIndex >= 0) {
                e.preventDefault();
                handleSelect(filtered[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div className="relative flex-1" ref={containerRef}>
            <div className={variantClasses.wrapper}>
                <MdSearch className={variantClasses.icon} />
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => { onChange(e.target.value); setOpen(true); setActiveIndex(-1); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={variantClasses.input}
                />
            </div>

            {open && filtered.length > 0 && (
                <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                >
                    {filtered.map((s, index) => (
                        <li
                            key={s}
                            role="option"
                            aria-selected={index === activeIndex}
                            onClick={() => handleSelect(s)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                                index === activeIndex
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
