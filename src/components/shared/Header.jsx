import Link from "next/link";

const Header = () => {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-subtle dark:border-[#2a3038] px-10 py-3 bg-white dark:bg-background-dark transition-colors duration-200">
            <Link href="/" className="flex items-center gap-4">
                <div className="text-primary size-8">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                {/* Added dark:text-white */}
                <h2 className="text-xl font-bold leading-tight tracking-tight dark:text-white">
                    RehabMarket
                </h2>
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
