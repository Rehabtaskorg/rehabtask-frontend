import Link from "next/link";
import Image from "next/image";

const Header = () => {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-subtle  px-10 py-3 bg-white  transition-colors duration-200">
            <Link href="/" className="flex items-center shrink-0">
                <Image
                    src="/images/logo/rehabtask_horizontal.png"
                    alt="RehabTask"
                    width={160}
                    height={49}
                    className="h-9 w-auto"
                    priority
                />
            </Link>

            <div className="flex items-center gap-4">
                <span className="text-sm text-text-muted hidden md:block">
                    Already have an account?
                </span>
                <Link
                    href="/login"
                    className="flex min-w-21 cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal transition-opacity hover:opacity-90"
                >
                    Log in
                </Link>
            </div>
        </header>
    );
};

export default Header;
