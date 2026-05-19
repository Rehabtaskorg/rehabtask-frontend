"use client";

import Link from "next/link";
import { useTherapistProfile } from "@/hooks/useTherapistProfile";
import {
    MdError,
    MdPerson,
    MdDescription,
    MdSupportAgent,
    MdInfo,
    MdArrowForward,
} from "react-icons/md";

const QUICK_ACTIONS = [
    { label: "Review My Profile", href: "/therapist/profile", icon: MdPerson, description: "Check and update your personal details" },
    { label: "Update Credentials", href: "/therapist/profile", icon: MdDescription, description: "Resubmit your license and documents" },
    { label: "Contact Support", href: "mailto:support@rehabtask.com", icon: MdSupportAgent, description: "Get help from our team", external: true },
];

export default function DashboardRejectedView() {
    const { profile, loading } = useTherapistProfile();

    const firstName = profile?.fullName?.split(" ")[0] || "there";

    if (loading) {
        return (
            <div className="p-4 sm:p-8">
                <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
                    <div className="h-8 bg-slate-200  rounded w-1/3"></div>
                    <div className="h-32 bg-slate-200  rounded-xl"></div>
                    <div className="h-40 bg-slate-200  rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <header>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 ">
                        Welcome back, {firstName}
                    </h2>
                    <p className="text-sm text-text-muted  mt-1">
                        Your application requires some updates before it can be approved.
                    </p>
                </header>

                {/* Rejection Alert */}
                <div className="flex items-start gap-3 p-5 bg-red-50  border border-red-200  rounded-xl">
                    <MdError className="text-red-500 text-xl shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-base font-bold text-red-800 ">
                            Your application needs attention
                        </h3>
                        <p className="text-sm text-red-700  mt-1">
                            Our review team has identified issues that need to be resolved before your account can be approved.
                        </p>
                    </div>
                </div>

                {/* Rejection Reason Card */}
                <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-text-main  mb-3">
                        Review Feedback
                    </h3>
                    <div className="bg-red-50/50  border border-red-100  rounded-lg p-4">
                        <p className="text-sm text-red-800  leading-relaxed">
                            {profile?.rejectionReason ||
                                "Our review team found issues with your application. Please review your credentials and contact support for specific details."}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h3 className="text-lg font-bold text-text-main  mb-4">
                        Next Steps
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {QUICK_ACTIONS.map((action) => {
                            const Icon = action.icon;
                            const Wrapper = action.external ? "a" : Link;
                            const wrapperProps = action.external
                                ? { href: action.href, target: "_blank", rel: "noopener noreferrer" }
                                : { href: action.href };

                            return (
                                <Wrapper
                                    key={action.label}
                                    {...wrapperProps}
                                    className="flex flex-col items-start gap-3 bg-card-light  border border-border-light  rounded-xl p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
                                >
                                    <div className="p-2.5 bg-primary/10 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="text-primary text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-main  group-hover:text-primary transition-colors flex items-center gap-1">
                                            {action.label}
                                            <MdArrowForward className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                        <p className="text-xs text-text-muted  mt-0.5">
                                            {action.description}
                                        </p>
                                    </div>
                                </Wrapper>
                            );
                        })}
                    </div>
                </div>

                {/* How to Resolve Info Card */}
                <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6">
                    <div className="flex items-start gap-3">
                        <MdInfo className="text-primary text-xl shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-text-main ">
                                How to resolve this
                            </h3>
                            <div className="mt-2 space-y-2 text-sm text-text-muted ">
                                <p>
                                    Review the feedback above and update the relevant sections of your profile. Common issues include expired licenses, unclear document scans, or incomplete professional details.
                                </p>
                                <p>
                                    Once you&apos;ve made the necessary updates, your profile will be automatically re-submitted for review. The re-review process typically takes 24-48 hours.
                                </p>
                                <p>
                                    If you believe this was an error or need clarification, please contact our support team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}