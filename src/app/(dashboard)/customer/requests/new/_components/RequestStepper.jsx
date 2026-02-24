"use client";

import { MdCheck } from "react-icons/md";

const STEPS = [
    { num: 1, label: "Service Details" },
    { num: 2, label: "Location" },
    { num: 3, label: "Review & Post" },
];

export default function RequestStepper({ currentStep }) {
    return (
        <div className="flex items-start">
            {STEPS.map((step, index) => {
                const isCompleted = step.num < currentStep;
                const isActive = step.num === currentStep;
                const isPending = step.num > currentStep;

                return (
                    <div key={step.num} className="flex items-start flex-1">
                        <div className="flex flex-col items-center">
                            {/* Circle */}
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isCompleted
                                    ? "bg-emerald-500 text-white"
                                    : isActive
                                        ? "bg-primary text-white"
                                        : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500"
                                    }`}
                            >
                                {isCompleted ? <MdCheck className="text-lg" /> : step.num}
                            </div>
                            {/* Label */}
                            <span
                                className={`hidden sm:block mt-2 text-xs font-medium text-center ${isActive
                                    ? "text-primary font-bold"
                                    : isCompleted
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-text-muted dark:text-gray-500"
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {index < STEPS.length - 1 && (
                            <div
                                className={`flex-1 h-0.5 mx-2 sm:mx-4 mt-4.5 ${step.num < currentStep
                                    ? "bg-emerald-500"
                                    : "bg-slate-200 dark:bg-slate-700"
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    )
}