"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdError } from "react-icons/md";
import Button from "@/components/ui/Button";
import { usePageTitle } from "@/hooks/usePageTitle";

function OAuthErrorContent() {
    usePageTitle("Authentication Error");
    const searchParams = useSearchParams();
    const errorMessage =
        searchParams.get("message") ||
        "Authentication failed. Please try again.";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50  p-4">
            <div className="w-full max-w-md bg-white  shadow-xl rounded-xl overflow-hidden border border-border-subtle ">
                <div className="px-8 py-12 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-100  rounded-full">
                            <MdError className="text-5xl text-red-500" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-text-main  mb-3">
                        Authentication Failed
                    </h1>

                    <p className="text-text-muted  mb-8">
                        {errorMessage}
                    </p>

                    <div className="space-y-3">
                        <Link href="/login">
                            <Button variant="primary" size="lg" fullWidth>
                                Back to Login
                            </Button>
                        </Link>

                        <p className="text-sm text-text-muted ">
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
