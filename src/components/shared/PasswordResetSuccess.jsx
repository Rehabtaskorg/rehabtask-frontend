"use client";

import { MdCheckCircle, MdArrowBack } from "react-icons/md";
import Button from "../ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PasswordResetSuccess = () => {
    const router = useRouter();

    const handleLoginClick = () => {
        router.push("/login");
    }

    return (
        <div className="max-w-120 w-full bg-white dark:bg-background-dark/50 border border-border-subtle dark:border-white/5 rounded-xl shadow-xl overflow-hidden p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
                <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                    <MdCheckCircle className="text-[48px]" />
                </div>
            </div>

            {/* Headline Text */}
            <h1 className="text-text-main dark:text-white tracking-tight text-2xl md:text-3xl font-bold leading-tight pb-3">
                Password Successfully Updated
            </h1>

            {/* Body Text */}
            <p className="text-text-muted dark:text-gray-400 text-base font-normal leading-relaxed pb-8">
                Your account is now secure. You can use your new password to access your rehabilitation dashboard and manage your appointments.
            </p>

            {/* Illustrated Success Visual */}
            <div className="hidden md:flex w-full justify-center mb-8">
                <div className="w-full h-32 bg-primary/5 dark:bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden border border-primary/10">
                    <div className="flex items-center gap-3 text-primary">
                        <MdCheckCircle className="text-5xl" />
                        <div className="text-left">
                            <p className="text-lg font-bold">All Set!</p>
                            <p className="text-sm opacity-70">Your password has been updated</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleLoginClick}
                    className="shadow-md active:scale-95 transition-transform"
                >
                    Log In Now
                </Button>

                <Link
                    href="/"
                    className="text-primary text-sm font-medium hover:underline flex items-center justify-center gap-1"
                >
                    <MdArrowBack className="text-sm" />
                    Back to Homepage
                </Link>
            </div>
        </div>
    );
};

export default PasswordResetSuccess;