"use client";

import { useRouter } from "next/navigation";
import { MdWarning } from "react-icons/md";

/**
 * Error boundary for the customer request detail route.
 *
 * @param {Object}   props
 * @param {Error}    props.error
 * @param {Function} props.reset
 */
export default function Error({ error, reset }) {
    const router = useRouter();
    return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                <MdWarning className="text-3xl text-red-500 mx-auto mb-2" />
                <p className="text-red-800 dark:text-red-300 font-bold">
                    {error?.message || "Something went wrong loading this request."}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                    <button onClick={reset} className="text-sm text-primary font-bold hover:underline">
                        Try again
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <button
                        onClick={() => router.push("/customer/requests")}
                        className="text-sm text-primary font-bold hover:underline"
                    >
                        Back to My Requests
                    </button>
                </div>
            </div>
        </div>
    );
}