"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MdMenu, MdClose } from "react-icons/md";

const NAV_LINKS = [
    { label: "Find Therapists", href: "/therapists" },
    { label: "Browse Requests", href: "/requests" },
    { label: "For Therapists", href: "/therapist-jobs" },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <Link href="/" className="flex items-center shrink-0">
                        <Image
                            src="/images/logo/rehabtask_horizontal.png"
                            alt="RehabTask"
                            height={32}
                            width={120}
                            priority
                            className="h-8 w-auto"
                        />
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            href="/login"
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/register/customer"
                            className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Sign up
                        </Link>
                    </div>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-gray-600"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <MdClose className="text-2xl" /> : <MdMenu className="text-2xl" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 space-y-2">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2.5 text-sm font-medium text-gray-700 hover:text-primary"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                        <Link href="/login" className="py-2.5 text-sm font-medium text-gray-700 text-center">
                            Log in
                        </Link>
                        <Link href="/register/customer" className="py-2.5 text-sm font-semibold text-white bg-primary rounded-lg text-center">
                            Sign up
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
