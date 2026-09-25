import Link from "next/link";

// TODO: Add /about and /pricing pages — links stubbed until pages are built
const FOOTER_LINKS = {
    Platform: [
        { label: "How it works", href: "/#how-it-works" },
    ],
    "For Agencies": [
        { label: "Find therapists", href: "/register/customer" },
        { label: "Sign up free", href: "/register/customer" },
    ],
    "For Therapists": [
        { label: "Join network", href: "/register/therapist" },
        { label: "Browse open cases", href: "/requests" },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <Link href="/" className="text-xl font-bold text-white">RehabTask</Link>
                    </div>
                    {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                        <div key={category}>
                            <p className="text-sm font-semibold text-white mb-4">{category}</p>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-sm hover:text-white transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex gap-6 text-xs">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                    <p className="text-xs">&copy; {new Date().getFullYear()} RehabTask Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
