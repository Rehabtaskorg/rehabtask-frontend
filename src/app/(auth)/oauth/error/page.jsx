"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdError } from "react-icons/md";
import Button from "@/components/ui/Button";

function OAuthErrorContent() {
    const searchParams = useSearchParams();
    const errorMessage =
        searchParams.get("message") ||
        "Authentication failed. Please try again.";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1a2632] shadow-xl rounded-xl overflow-hidden border border-border-subtle dark:border-[#2d3a4a]">
                <div className="px-8 py-12 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                            <MdError className="text-5xl text-red-500" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-text-main dark:text-white mb-3">
                        Authentication Failed
                    </h1>

                    <p className="text-text-muted dark:text-[#a1b0c0] mb-8">
                        {errorMessage}
                    </p>

                    <div className="space-y-3">
                        <Link href="/login">
                            <Button variant="primary" size="lg" fullWidth>
                                Back to Login
                            </Button>
                        </Link>

                        <p className="text-sm text-text-muted dark:text-[#a1b0c0]">
                            Need help?{" "}
                            <Link
                                href="/support"
                                className="text-primary font-semibold hover:underline"
                            >
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OAuthErrorPage() {
    return (
        <Suspense fallback={null}>
            <OAuthErrorContent />
        </Suspense>
    );
}
