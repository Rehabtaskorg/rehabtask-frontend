import Link from "next/link";
import { MdCopyright } from "react-icons/md";

const Footer = () => {
    return (
        <footer className="max-w-160 mx-auto mt-12 mb-12 flex justify-between items-center text-xs text-text-muted px-6 md:px-0">
            <div className="flex items-center gap-1">
                <MdCopyright className="text-[14px] shrink-0" />
                <span>2024–{new Date().getFullYear()} RehabTask Inc.</span>
            </div>
            <div className="flex gap-4">
                <Link
                    href="/help"
                    className="hover:text-primary transition-colors focus:outline-none focus:underline"
                >
                    Help Center
                </Link>
                <Link
                    href="/contact"
                    className="hover:text-primary transition-colors focus:outline-none focus:underline"
                >
                    Contact Support
                </Link>
            </div>
        </footer>
    )
};

export default Footer;