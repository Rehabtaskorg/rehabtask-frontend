"use client";

import { MdCheckCircle } from "react-icons/md";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
    return (
        <div className="max-w-lg mx-auto mt-20 text-center">
            <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark p-8 shadow-sm">
                <MdCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-text-main dark:text-white mb-2">Subscription Activated!</h1>
                <p className="text-text-muted dark:text-slate-400 mb-6">
                    Your plan has been upgraded successfully. You now have access to all your new features.
                </p>
                <Link
                    href="/customer/subscription"
                    className="inline-block px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    View Your Plan
                </Link>
            </div>
        </div>
    );
}