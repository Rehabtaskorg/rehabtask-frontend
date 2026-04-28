/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { APIProvider } from "@vis.gl/react-google-maps";
import { useTherapistProfile } from "@/hooks/useTherapistProfile";
import { useTherapistAccess } from "@/contexts/TherapistAccessContext";
import ProfileTab from "@/components/therapist/profile/ProfileTab";
import WorkAreasTab from "@/components/therapist/profile/WorkAreasTab";
import AvailabilityTab from "@/components/therapist/profile/AvailabilityTab";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { MdPerson, MdMap, MdSchedule, MdRefresh, MdInfo, MdError } from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import UserAvatar from "@/components/ui/UserAvatar";

const TABS = [
    { key: "profile", label: "Profile", icon: MdPerson },
    { key: "work-areas", label: "Work Areas", icon: MdMap },
    { key: "availability", label: "Availability", icon: MdSchedule },
]

function ProfilePageSkeleton() {
    return (
        <div className="p-4 md:p-6">
            <div className="animate-pulse space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2">
                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
        </div>
    );
}

function TherapistProfileContent() {
    usePageTitle("My Profile");
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState("profile");
    const { profile, loading, error, refetch } = useTherapistProfile();
    const { approvalStatus, onboardingComplete } = useTherapistAccess();

    // Sync tab from URL query param (e.g., ?tab=availability)
    useEffect(() => {
        if (tabFromUrl && TABS.some((t) => t.key === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    if (loading) {
        return <ProfilePageSkeleton />;
    }

    if (error || !profile) {
        return (
            <div className="p-4 md:p-6">
                <Alert
                    type="error"
                    message="Failed to load your profile. Please try again."
                />
                <div className="mt-4">
                    <Button variant="secondary" onClick={refetch}>
                        <MdRefresh className="text-lg" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }


    const approvalColor = {
        approved: "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200",
        pending: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
        review: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200",
        rejected: "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200",
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <UserAvatar
                    name={profile.fullName}
                    photoUrl={profile.profilePhotoUrl}
                    size="xl"
                    className="border-2 border-border-light dark:border-border-dark"
                />
                <div>
                    <h1 className="text-2xl font-bold text-text-main dark:text-white">
                        {profile.fullName || "My Profile"}
                    </h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {profile.specialization && (
                            <span className="text-sm text-text-muted">
                                {profile.specialization}
                            </span>
                        )}
                        {profile.approvalStatus && (
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${approvalColor[profile.approvalStatus] || approvalColor.pending
                                    }`}
                            >
                                {profile.approvalStatus === "review" ? "Under Review" : profile.approvalStatus}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Banner — shown for non-approved therapists */}
            {!onboardingComplete && (approvalStatus === "pending" || approvalStatus === "review") && (
                <div className="flex items-start gap-3 p-4 mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <MdInfo className="text-blue-600 dark:text-blue-400 text-xl shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                            Complete your onboarding to unlock all features
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Your profile is not yet visible to patients. Finish your onboarding setup to submit your application for review.
                        </p>
                    </div>
                </div>
            )}
            {onboardingComplete && (approvalStatus === "pending" || approvalStatus === "review") && (
                <div className="flex items-start gap-3 p-4 mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                    <MdInfo className="text-yellow-600 dark:text-yellow-400 text-xl shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                            Your credentials are under review
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                            You can update your personal information and availability while we review your credentials. Credential fields are locked during review.
                        </p>
                    </div>
                </div>
            )}

            {approvalStatus === "rejected" && (
                <div className="flex items-start gap-3 p-4 mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <MdError className="text-red-500 text-xl shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
                            Your application needs attention
                        </h3>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                            {profile.rejectionReason || "Please review your credentials and contact support for details on what needs to be updated."}
                        </p>
                    </div>
                </div>
            )}

            {/* Tab Bar */}
            <div className="flex items-center gap-1 bg-muted-light dark:bg-muted-dark p-1 rounded-xl mb-8 overflow-x-auto">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive
                                ? "bg-primary text-white shadow-sm"
                                : "text-text-muted hover:text-text-main dark:hover:text-white"
                                }`}
                        >
                            <Icon className="text-lg" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Active Tab Content */}
            {activeTab === "profile" && <ProfileTab profile={profile} approvalStatus={approvalStatus} onboardingComplete={onboardingComplete} />}
            {activeTab === "work-areas" && <WorkAreasTab profile={profile} />}
            {activeTab === "availability" && <AvailabilityTab profile={profile} />}
        </div>
    );
}

export default function TherapistProfilePage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <Suspense fallback={<ProfilePageSkeleton />}>
                <TherapistProfileContent />
            </Suspense>
        </APIProvider>
    );
}