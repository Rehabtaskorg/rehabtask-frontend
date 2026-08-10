"use client";

import { useState } from "react";
import {
    MdPerson,
    MdEdit,
    MdWork,
    MdLock,
    MdDescription,
    MdOpenInNew,
    MdVerified,
    MdPending,
    MdCancel,
    MdCheckCircle,
} from "react-icons/md";
import { LICENSE_TYPES } from "@/lib/constants/credentials";
import { APPROVAL_STATUS } from "@/lib/constants";
import { onboardingAPI } from "@/services/onboarding.api";
import { logger } from "@/lib/logger";
import ProfileEditModal from "./ProfileEditModal";
import { ClinicalProfileSection } from "./ClinicalProfileSection";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";

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
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewingDoc, setViewingDoc] = useState(null);

    const isCredentialsLocked = onboardingComplete && (approvalStatus === APPROVAL_STATUS.PENDING || approvalStatus === APPROVAL_STATUS.REVIEW);

    const licenseTypeLabel =
        LICENSE_TYPES.find((lt) => lt.value === profile?.primaryLicenseType)?.label ||
        profile?.primaryLicenseType ||
        "—";

    const handleViewDocument = async (docId) => {
        setViewingDoc(docId);
        try {
            const res = await onboardingAPI.getDocumentUrl(docId);
            const url = res.data?.data?.signedUrl || res.data?.signedUrl;
            if (url) {
                window.open(url, "_blank");
            }
        } catch (err) {
            logger.error("Error fetching document URL:", err);
        } finally {
            setViewingDoc(null);
        }
    }

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
                                <InfoRow label="Phone" value={profile?.phone} />
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
                        </div>

                        {profile?.professionalSummary && (
                            <div className="mt-4 pt-4 border-t border-border-light ">
                                <p className="text-sm text-text-muted mb-1">Professional Summary</p>
                                <p className="text-sm text-text-main  leading-relaxed whitespace-pre-wrap">
                                    {profile.professionalSummary}
                                </p>
                            </div>
                        )}
                    </div>
                    <ClinicalProfileSection profile={profile} />
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Account Status */}
                    <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-bold text-text-main  mb-4">
                            Account Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Approval</span>
                                {!onboardingComplete && profile?.approvalStatus === APPROVAL_STATUS.PENDING ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100  text-text-muted ">
                                        Not Submitted
                                    </span>
                                ) : (
                                    <StatusBadge status={profile?.approvalStatus} />
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Onboarding</span>
                                <span
                                    className={`inline-flex items-center gap-1 text-xs font-semibold ${profile?.onboardingComplete
                                        ? "text-green-600 "
                                        : "text-yellow-600 "
                                        }`}
                                >
                                    <MdCheckCircle className="text-sm" />
                                    {profile?.onboardingComplete ? "Complete" : "Incomplete"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Payouts</span>
                                <span
                                    className={`inline-flex items-center gap-1 text-xs font-semibold ${profile?.stripeOnboardingComplete
                                        ? "text-green-600 "
                                        : "text-yellow-600 "
                                        }`}
                                >
                                    <MdCheckCircle className="text-sm" />
                                    {profile?.stripeOnboardingComplete ? "Active" : "Not set up"}
                                </span>
                            </div>
                        </div>

                        {/* Contextual status message for pending/review */}
                        {(approvalStatus === APPROVAL_STATUS.PENDING || approvalStatus === APPROVAL_STATUS.REVIEW) && (
                            <div className="mt-4 pt-3 border-t border-border-light ">
                                {onboardingComplete ? (
                                    <>
                                        <p className="text-xs text-text-muted ">
                                            Estimated review time: <span className="font-semibold text-text-main ">24-48 hours</span>
                                        </p>
                                        <p className="text-xs text-text-muted  mt-1">
                                            Your profile is hidden from patients until approved.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs text-text-muted ">
                                            Complete your onboarding to submit for review.
                                        </p>
                                        <p className="text-xs text-text-muted  mt-1">
                                            Your profile is hidden from patients until approved.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Contextual status message for rejected */}
                        {approvalStatus === APPROVAL_STATUS.REJECTED && (
                            <div className="mt-4 pt-3 border-t border-red-200 ">
                                <p className="text-xs font-semibold text-red-700 ">
                                    Action required — please update your credentials
                                </p>
                                {profile?.rejectionReason && (
                                    <p className="text-xs text-red-600  mt-1">
                                        {profile.rejectionReason}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* License Documents */}
                    <div className="bg-card-light  border border-border-light  rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MdDescription className="text-primary text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-text-main ">
                                License Documents
                            </h3>
                        </div>

                        {profile?.licenseDocuments?.length > 0 ? (
                            <div className="space-y-3">
                                {profile.licenseDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between bg-muted-light  rounded-lg p-3 border border-border-light "
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-text-main  truncate">
                                                {doc.fileName}
                                            </p>
                                            <p className="text-xs text-text-muted">
                                                {doc.uploadedAt
                                                    ? new Date(doc.uploadedAt).toLocaleDateString()
                                                    : ""}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleViewDocument(doc.id)}
                                            disabled={viewingDoc === doc.id}
                                            className="flex items-center gap-1 text-primary text-sm font-medium hover:text-primary/80 transition-colors ml-2 disabled:opacity-50"
                                        >
                                            <MdOpenInNew className="text-base" />
                                            {viewingDoc === doc.id ? "Opening..." : "View"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted text-center py-4">
                                No documents uploaded
                            </p>
                        )}

                        {/* Update Credentials button for rejected therapists */}
                        {approvalStatus === APPROVAL_STATUS.REJECTED && (
                            <button
                                onClick={() => window.location.href = "/therapist/onboarding/credentials"}
                                className="mt-3 w-full px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:brightness-95 transition-all"
                            >
                                Update Credentials
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ProfileEditModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                profile={profile}
                onSuccess={() => setShowEditModal(false)}
            />
        </>
    )

}

export default ProfileTab;