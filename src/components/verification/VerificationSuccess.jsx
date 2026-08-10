"use client";

import { MdCheckCircle, MdPersonSearch, MdEditNote, MdWork, MdLock } from "react-icons/md";
import Button from "../ui/Button";
import { USER_ROLES } from "@/lib/constants";

const COPY = {
    [USER_ROLES.THERAPIST]: {
        body: "Your account is verified and ready. Complete your onboarding to set up your profile and start receiving patient requests.",
        nextSteps: [
            { icon: <MdEditNote className="text-primary text-2xl shrink-0" />, label: "Complete onboarding" },
            { icon: <MdWork className="text-primary text-2xl shrink-0" />, label: "Browse patient requests" },
        ],
    },
    [USER_ROLES.CUSTOMER]: {
        body: "You're all set to find the right therapist and start your recovery journey. Your personal dashboard is ready for you to book your first session.",
        nextSteps: [
            { icon: <MdPersonSearch className="text-primary text-2xl shrink-0" />, label: "Browse therapists" },
            { icon: <MdEditNote className="text-primary text-2xl shrink-0" />, label: "Complete profile" },
        ],
    },
};

/**
 * @param {{ role: string, onContinue: () => void }} props
 */
export function VerificationSuccess({ role, onContinue }) {
    const copy = COPY[role] ?? COPY[USER_ROLES.CUSTOMER];

    return (
        <div className="max-w-140 w-full bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
            <div className="flex justify-center mb-8">
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-success/10 rounded-full scale-150 blur-xl"></div>
                    <div className="bg-success text-white rounded-full p-4 flex items-center justify-center relative z-10 shadow-lg shadow-success/30">
                        <MdCheckCircle className="text-5xl" />
                    </div>
                </div>
            </div>

            <div className="space-y-2 text-center">
                <h1 className="text-slate-900 tracking-tight text-[32px] md:text-[36px] font-bold leading-tight">
                    Welcome to RehabTask!
                </h1>
                <h2 className="text-success tracking-tight text-[22px] md:text-[24px] font-semibold leading-tight">
                    Your account is verified
                </h2>
            </div>

            <div className="mt-6 text-center">
                <p className="text-slate-600 text-lg font-normal leading-relaxed">
                    {copy.body}
                </p>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={onContinue}
                    className="max-w-[320px] shadow-lg shadow-primary/20"
                >
                    Continue to Login
                </Button>

                <p className="text-sm text-slate-500 flex items-center gap-2">
                    <MdLock className="text-base" />
                    Secure portal
                </p>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100">
                <h3 className="text-slate-900 text-sm font-bold uppercase tracking-widest mb-4 text-center">
                    Next Steps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {copy.nextSteps.map(({ icon, label }) => (
                        <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 transition-colors hover:bg-slate-100">
                            {icon}
                            <span className="text-sm font-medium text-slate-700">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
