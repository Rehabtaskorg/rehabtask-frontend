"use client";

import Link from "next/link";
import { useTherapistProfile } from "@/hooks/useTherapistProfile";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import {
    MdCheckCircle,
    MdAccessTime,
    MdPerson,
    MdPayments,
    MdSchedule,
    MdMap,
    MdInfo,
    MdEmail,
    MdArrowForward,
} from "react-icons/md";
import Image from "next/image";

function buildTimelineSteps(onboardingStep, onboardingComplete) {
    const profileDone = onboardingStep >= 2;
    const credentialsDone = onboardingStep >= 3;
    const backgroundDone = onboardingStep >= 5;

    return [
        { label: "Profile Created", complete: profileDone },
        { label: "Credentials Submitted", complete: credentialsDone },
        { label: "Background Check", complete: backgroundDone },
        {
            label: "Final Quality Audit",
            complete: false,
            inProgress: onboardingComplete,
            estimate: onboardingComplete ? "Est. 24-48 hours" : null,
        },
    ];
}

export default function DashboardPendingView() {
    const { profile, loading } = useTherapistProfile();
    const { onboardingStep, onboardingComplete } = useTherapistAccess();

    const firstName = profile?.fullName?.split(" ")[0] || "there";
    const initials = profile?.fullName
        ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    const quickActions = [
        { label: "Review My Profile", href: "/therapist/profile", icon: MdPerson, description: "Check your personal and professional details" },
        {
            label: "Payment Setup",
            href: "/therapist/account-settings",
            icon: MdPayments,
            description: profile?.stripeOnboardingComplete
                ? "Manage your payout account settings"
                : "Set up your payout account to receive earnings",
            badge: !profile?.stripeOnboardingComplete ? "Action needed" : null,
        },
        { label: "Update Availability", href: "/therapist/profile?tab=availability", icon: MdSchedule, description: "Adjust your weekly schedule" },
        { label: "Update Work Areas", href: "/therapist/profile?tab=work-areas", icon: MdMap, description: "Refine your service coverage" },
    ];

    if (loading) {
        return (
            <div className="p-4 sm:p-8">
                <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <header className="flex items-center gap-4">
                    {profile?.profilePhotoUrl ? (
                        <Image
                            src={profile.profilePhotoUrl}
                            alt={profile.fullName}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover border-2 border-border-light dark:border-border-dark shrink-0"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border-light dark:border-border-dark shrink-0">
                            <span className="text-primary text-sm font-bold">{initials}</span>
                        </div>
                    )}
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Welcome, {firstName}
                        </h2>
                        <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
                            {onboardingComplete
                                ? "Your account is being reviewed"
                                : "Complete your onboarding to get started"}
                        </p>
                    </div>
                </header>

                {/* Review Status Card */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-5">
                        Verification Progress
                    </h3>
                    <div className="space-y-4">
                        {buildTimelineSteps(onboardingStep, onboardingComplete).map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                                {step.complete ? (
                                    <MdCheckCircle className="text-green-500 text-xl shrink-0 mt-0.5" />
                                ) : step.inProgress ? (
                                    <MdAccessTime className="text-primary text-xl shrink-0 mt-0.5 animate-pulse" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p
                                        className={`text-sm font-medium ${step.complete
                                            ? "text-green-700 dark:text-green-300"
                                            : step.inProgress
                                                ? "text-primary font-semibold"
                                                : "text-text-muted dark:text-gray-400"
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                    {step.estimate && (
                                        <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                            {step.estimate}
                                        </p>
                                    )}
                                </div>
                                {step.complete && (
                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Done</span>
                                )}
                                {step.inProgress && (
                                    <span className="text-xs text-primary font-semibold">In Progress</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                        {onboardingComplete ? "While You Wait" : "Get Started"}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="flex items-start gap-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
                                >
                                    <div className="p-2.5 bg-primary/10 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="text-primary text-xl" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-text-main dark:text-white group-hover:text-primary transition-colors">
                                                {action.label}
                                            </p>
                                            {action.badge && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                                                    {action.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                            {action.description}
                                        </p>
                                    </div>
                                    <MdArrowForward className="text-text-muted dark:text-gray-500 text-lg shrink-0 mt-1 group-hover:text-primary transition-colors" />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* What Happens Next Info Card */}
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6">
                    <div className="flex items-start gap-3">
                        <MdInfo className="text-primary text-xl shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-text-main dark:text-white">
                                What happens next?
                            </h3>
                            <div className="mt-2 space-y-2 text-sm text-text-muted dark:text-gray-400">
                                {onboardingComplete ? (
                                    <>
                                        <p>
                                            Our team is reviewing your credentials and background check. This typically takes 24-48 hours.
                                        </p>
                                        <p>
                                            While under review, your profile is hidden from patients. Once approved, you&apos;ll be visible in search results and can start receiving session requests.
                                        </p>
                                        <p>
                                            You&apos;ll receive an email notification as soon as your account is approved.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            Complete your profile, credentials, availability, and background check to submit your application for review.
                                        </p>
                                        <p>
                                            Once submitted, our team will review your application within 24-48 hours. After approval, you&apos;ll be visible to patients and can start accepting session requests.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Support CTA */}
                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <MdEmail className="text-primary text-xl shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-text-main dark:text-white">
                                    Need help?
                                </h3>
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                                    Have questions about the review process or need to update something?
                                </p>
                            </div>
                        </div>
                        <a
                            href="mailto:support@rehabtask.com"
                            className="px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:brightness-95 transition-all shrink-0"
                        >
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}