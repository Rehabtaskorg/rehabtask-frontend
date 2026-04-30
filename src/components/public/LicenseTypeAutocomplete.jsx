"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MdSearch, MdClose } from "react-icons/md";
import { LICENSE_TYPES } from "@/lib/constants/credentials";

const VARIANTS = {
    compact: {
        wrapper: "flex-1 flex items-center bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 min-w-0",
        input: "bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm",
        icon: "text-gray-400 text-lg mr-2 shrink-0",
        clear: "text-gray-400 hover:text-gray-600 text-base ml-1 shrink-0",
    },
    stacked: {
        wrapper: "flex items-center bg-white px-4 py-4 rounded-xl border border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all",
        input: "bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 w-full placeholder:text-gray-400 text-sm",
        icon: "text-gray-400 text-xl mr-3 shrink-0",
        clear: "text-gray-400 hover:text-gray-600 text-lg ml-2 shrink-0",
    },
};

export default function LicenseTypeAutocomplete({
    value,
    onChange,
    placeholder = "License type",
    variant = "compact",
}) {
    const [inputValue, setInputValue] = useState(
        LICENSE_TYPES.find((lt) => lt.value === value)?.label || value || ""
    );
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef(null);

    const variantClasses = VARIANTS[variant] || VARIANTS.compact;

    // Keep display label in sync when value is changed externally (e.g. clear all)
    useEffect(() => {
        const match = LICENSE_TYPES.find((lt) => lt.value === value);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInputValue(match ? match.label : value || "");
    }, [value]);

    const filtered = useMemo(() => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return LICENSE_TYPES;
        return LICENSE_TYPES.filter(
            (lt) =>
                lt.label.toLowerCase().includes(q) ||
                lt.value.toLowerCase().includes(q)
        );
    }, [inputValue]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                // If user typed something that doesn't match a selection, revert
                const match = LICENSE_TYPES.find((lt) => lt.value === value);
                setInputValue(match ? match.label : value || "");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open, value]);

    const handleSelect = (licenseType) => {
        setInputValue(licenseType.label);
        onChange(licenseType.value);
        setOpen(false);
        setActiveIndex(-1);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setInputValue("");
        onChange("");
        setOpen(false);
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
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        onChange("");
                        setOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                    className={variantClasses.input}
                />
                {inputValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear license type"
                        className={variantClasses.clear}
                    >
                        <MdClose />
                    </button>
                )}
            </div>

            {open && filtered.length > 0 && (
                <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto"
                >
                    {filtered.map((lt, index) => (
                        <li
                            key={lt.value}
                            role="option"
                            aria-selected={index === activeIndex}
                            onClick={() => handleSelect(lt)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                                index === activeIndex
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {lt.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
