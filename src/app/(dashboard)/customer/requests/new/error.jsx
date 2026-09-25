"use client";

import { useRouter } from "next/navigation";
import { MdWarning } from "react-icons/md";

/**
 * @param {{ error: Error, reset: () => void }} props
 */
export default function Error({ error, reset }) {
    const router = useRouter();
    return (
        <div className="p-4 md:p-6 max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <MdWarning className="text-3xl text-red-500 mx-auto mb-2" />
                <p className="text-red-800 font-bold">
                    {error?.message || "Something went wrong loading this page."}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                    <button onClick={reset} className="text-sm text-primary font-bold hover:underline">
                        Try again
                    </button>
                    <span className="text-slate-300">·</span>
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
