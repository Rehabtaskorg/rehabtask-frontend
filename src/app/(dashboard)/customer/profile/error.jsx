"use client";

import { useRouter } from "next/navigation";
import { MdWarning } from "react-icons/md";

/**
 * @param {{ error: Error, reset: () => void }} props
 */
export default function Error({ error, reset }) {
    const router = useRouter();
    return (
        <div className="mx-auto max-w-4xl p-4 md:p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                <MdWarning className="mx-auto mb-2 text-3xl text-red-500" aria-hidden="true" />
                <p className="font-bold text-red-800">
                    {error?.message || "Something went wrong loading your profile."}
                </p>
                <div className="mt-3 flex items-center justify-center gap-3">
                    <button onClick={reset} className="text-sm font-bold text-primary hover:underline">
                        Try again
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                        onClick={() => router.push("/customer/dashboard")}
                        className="text-sm font-bold text-primary hover:underline"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
