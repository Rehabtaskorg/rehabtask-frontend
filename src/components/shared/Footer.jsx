import { MdCopyright } from "react-icons/md";

const Footer = () => {
    return (
        <footer className="max-w-160 mx-auto mt-12 mb-12 flex justify-between items-center text-xs text-text-muted px-6 md:px-0">
            <div className="flex items-center gap-1">
                <MdCopyright className="text-[14px] shrink-0" />
                <span>{new Date().getFullYear()} RehabTask Inc.</span>
            </div>
            <div className="flex gap-4">
                <a
                    href="mailto:support@rehabtask.com"
                    className="hover:text-primary transition-colors focus:outline-none focus:underline"
                >
                    Contact Support
                </a>
            </div>
        </footer>
    )
};

export default Footer;