"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MdMenu, MdClose } from "react-icons/md";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import LicenseTypeAutocomplete from "./LicenseTypeAutocomplete";

const MENU_ITEMS = [
    { label: "Sign up", href: "/register/customer", variant: "cta" },
    { label: "Log in", href: "/login", variant: "link" },
    { type: "divider" },
    { label: "Find Therapists", href: "/therapists", variant: "link" },
    { label: "Browse Requests", href: "/requests", variant: "link" },
    { label: "For Therapists", href: "/register/therapist", variant: "link" },
];

function HamburgerMenu({ onClose }) {
    return (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            <ul className="py-2">
                {MENU_ITEMS.map((item, i) => {
                    if (item.type === "divider") {
                        return <li key={`d-${i}`} className="my-2 border-t border-gray-100" />;
                    }
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={onClose}
                                className={`block px-4 py-2.5 text-sm transition-colors ${
                                    item.variant === "cta"
                                        ? "font-bold text-primary hover:bg-primary/5"
                                        : "font-medium text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {item.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function TherapistAppNavbar({
    searchQuery,
    setSearchQuery,
    locationQuery,
    setLocationQuery,
    onLocationSelect,
    onLocationClear,
    onSearch,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <nav className="relative md:fixed md:top-0 md:left-0 md:right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 md:gap-6 py-3">
                    <Link href="/" className="text-lg md:text-xl font-bold text-primary shrink-0">
                        RehabTask
                    </Link>

                    <form
                        onSubmit={handleSubmit}
                        className="hidden md:flex flex-1 items-center gap-2 min-w-0"
                    >
                        <LicenseTypeAutocomplete
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Discipline type"
                            variant="compact"
                        />

                        <div className="flex-1 max-w-xs">
                            <LocationAutocomplete
                                value={locationQuery}
                                onChange={setLocationQuery}
                                onSelect={onLocationSelect}
                                onClear={onLocationClear}
                                placeholder="City or zip code"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm shrink-0"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0" ref={menuRef}>
                        <Link
                            href="/register/customer"
                            className="hidden sm:inline-flex px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                            Sign up
                        </Link>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-label="Open menu"
                                className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 text-gray-700 transition-colors"
                            >
                                {menuOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
                            </button>
                            {menuOpen && <HamburgerMenu onClose={() => setMenuOpen(false)} />}
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="md:hidden flex flex-col gap-2 pb-3"
                >
                    <LicenseTypeAutocomplete
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Discipline type"
                        variant="compact"
                    />
                    <LocationAutocomplete
                        value={locationQuery}
                        onChange={setLocationQuery}
                        onSelect={onLocationSelect}
                        onClear={onLocationClear}
                        placeholder="City or zip code"
                    />
                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                        Search
                    </button>
                </form>
            </div>
        </nav>
    );
}
