import Link from "next/link";

const FOOTER_LINKS = {
    Platform: [
        { label: "About", href: "#" },
        { label: "How it works", href: "#" },
        { label: "Pricing", href: "#" },
    ],
    "For Customers": [
        { label: "Find therapists", href: "/register/customer" },
        { label: "Browse requests", href: "/register/therapist" },
    ],
    "For Therapists": [
        { label: "Join network", href: "/register/therapist" },
        { label: "How payouts work", href: "#" },
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
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                    <p className="text-xs">&copy; {new Date().getFullYear()} RehabTask Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
