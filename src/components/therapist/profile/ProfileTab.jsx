"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MdScience } from "react-icons/md";
import { APPROVAL_STATUS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { ClinicalProfileSection } from "./ClinicalProfileSection";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import { UserText } from "@/components/ui/UserText";

const StatusBadge = ({ status }) => {
    const config = {
        approved: {
            bg: "bg-green-100 ",
            text: "text-green-800 ",
            icon: <MdVerified className="text-sm" />,
            label: "Approved",
        },
        pending: {
            bg: "bg-yellow-100 ",
            text: "text-yellow-800 ",
            icon: <MdPending className="text-sm" />,
            label: "Pending",
        },
        review: {
            bg: "bg-yellow-100 ",
            text: "text-yellow-800 ",
            icon: <MdPending className="text-sm" />,
            label: "Under Review",
        },
        rejected: {
            bg: "bg-red-100 ",
            text: "text-red-800 ",
            icon: <MdCancel className="text-sm" />,
            label: "Rejected",
        },
    };

    const c = config[status] || config.pending;

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}
        >
            {c.icon}
            {c.label}
        </span>
    );
};

const InfoRow = ({ label, value, icon }) => (
    <div className="flex items-start gap-3 py-2">
        {icon && <span className="text-text-muted mt-0.5">{icon}</span>}
        <div className="min-w-0 flex-1">
            <p className="text-sm text-text-muted">{label}</p>
            <p className="text-base text-text-main  font-medium wrap-break-word">
                {value || "—"}
            </p>
        </div>
    </div>
);

const ProfileTab = ({ profile, approvalStatus, onboardingComplete }) => {
    const [openPanel, setOpenPanel] = useState(null);
    const router = useRouter();

    const closePanel = () => setOpenPanel(null);

    const isCredentialsLocked =
        onboardingComplete &&
        (approvalStatus === APPROVAL_STATUS.PENDING || approvalStatus === APPROVAL_STATUS.REVIEW);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column — spans 2 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MdPerson className="text-primary text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-text-main ">
                                    Personal Information
                                </h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowEditModal(true)}
                            >
                                <MdEdit className="text-base" />
                                Edit
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-5 mb-5">
                            <UserAvatar
                                name={profile?.fullName}
                                photoUrl={profile?.profilePhotoUrl}
                                size="xl"
                                className="border-2 border-border-light"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                                <InfoRow label="Full Name" value={profile?.fullName} />
                                <InfoRow
                                    label="Email"
                                    value={
                                        profile?.email ? (
                                            <span className="flex flex-col gap-0.5">
                                                <span>{profile.email}</span>
                                                <span className="text-xs text-text-muted font-normal">Shared with customers after a booking is confirmed</span>
                                            </span>
                                        ) : null
                                    }
                                />
                                <InfoRow label="Phone" value={profile?.phone} />
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm text-text-muted">SMS Notifications</p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            {smsOptIn ? "Receiving appointment reminders via SMS" : "SMS reminders disabled"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={smsOptIn}
                                        aria-label="Toggle SMS notifications"
                                        onClick={handleSmsToggle}
                                        disabled={!onboardingComplete || updateProfile.isPending}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${smsOptIn ? "bg-primary" : "bg-gray-300"}`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${smsOptIn ? "translate-x-5" : "translate-x-0"}`}
                                        />
                                    </button>
                                </div>
                                <InfoRow
                                    label="Years of Experience"
                                    value={
                                        profile?.yearsOfExperience != null
                                            ? `${profile.yearsOfExperience} years`
                                            : null
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MdWork className="text-primary text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-text-main ">
                                Professional Details
                            </h3>
                        </div>

                        {/* Credential lock notice for pending/review */}
                        {isCredentialsLocked && (
                            <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50  rounded-lg border border-yellow-200 ">
                                <MdLock className="text-yellow-600  text-sm shrink-0" />
                                <p className="text-xs text-yellow-700 ">
                                    Credential fields are locked while your application is under review. Contact support for changes.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                            <InfoRow
                                label="Rate per Visit"
                                value={profile?.ratePerVisit ? `$${parseFloat(profile.ratePerVisit).toFixed(2)}` : null}
                            />
                            <InfoRow
                                label="Attempted Visit Rate"
                                value={
                                    profile?.attemptedVisitRate != null
                                        ? parseFloat(profile.attemptedVisitRate) === 0
                                            ? "$0.00 (no charge for no-shows)"
                                            : `$${parseFloat(profile.attemptedVisitRate).toFixed(2)}`
                                        : "Not set"
                                }
                            />
                            <InfoRow label="Discipline type" value={licenseTypeLabel} />
                            <InfoRow
                                label="License Number"
                                value={profile?.licenseNumber}
                                icon={<MdLock className="text-sm" />}
                            />
                            <InfoRow
                                label="License State"
                                value={profile?.licenseState}
                                icon={<MdLock className="text-sm" />}
                            />
                            <InfoRow
                                label="NPI Number"
                                value={profile?.npiNumber}
                                icon={<MdLock className="text-sm" />}
                            />
                        </div>

                        {/*
                            Professional Summary (read-only) — HIDDEN (product decision, 2026-09-07).
                            Data layer unchanged; only this render is hidden.
                            To restore: uncomment this block as-is.

                            {profile?.professionalSummary && (
                                <div className="mt-4 pt-4 border-t border-border-light ">
                                    <p className="text-sm text-text-muted mb-1">Professional Summary</p>
                                    <UserText className="text-sm text-text-main leading-relaxed" preserveLineBreaks>
                                        {profile.professionalSummary}
                                    </UserText>
                                </div>
                            )}
                        */}
                    </div>
                </div>

                <div className="space-y-6">
                    <AccountStatusCard
                        profile={profile}
                        approvalStatus={approvalStatus}
                        isOnboardingComplete={onboardingComplete}
                    />

                    <DocumentsCard
                        profile={profile}
                        footerAction={
                            approvalStatus === APPROVAL_STATUS.REJECTED ? (
                                <Button
                                    variant="destructive"
                                    fullWidth
                                    className="mt-3"
                                    onClick={() => router.push("/therapist/onboarding/credentials")}
                                >
                                    Update Credentials
                                </Button>
                            ) : null
                        }
                    />
                </div>
            </div>

            <PersonalInfoDrawer
                isOpen={openPanel === PANELS.PERSONAL}
                onClose={closePanel}
                profile={profile}
                onSuccess={closePanel}
            />
            <RatesDrawer
                isOpen={openPanel === PANELS.RATES}
                onClose={closePanel}
                profile={profile}
                onSuccess={closePanel}
            />
            <CredentialsEditModal
                isOpen={openPanel === PANELS.CREDENTIALS}
                onClose={closePanel}
                profile={profile}
            />
            <ClinicalSkillsEditModal
                isOpen={openPanel === PANELS.CLINICAL}
                onClose={closePanel}
                profile={profile}
            />
        </>
    );
};

export default ProfileTab;
