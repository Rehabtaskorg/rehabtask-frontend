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
import { onboardingAPI } from "@/lib/onboarding.api";
import ProfileEditModal from "./ProfileEditModal";
import Button from "@/components/ui/Button";
import Image from "next/image";

const StatusBadge = ({ status }) => {
    const config = {
        approved: {
            bg: "bg-green-100 dark:bg-green-900/20",
            text: "text-green-800 dark:text-green-200",
            icon: <MdVerified className="text-sm" />,
            label: "Approved",
        },
        pending: {
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
            text: "text-yellow-800 dark:text-yellow-200",
            icon: <MdPending className="text-sm" />,
            label: "Pending",
        },
        review: {
            bg: "bg-yellow-100 dark:bg-yellow-900/20",
            text: "text-yellow-800 dark:text-yellow-200",
            icon: <MdPending className="text-sm" />,
            label: "Under Review",
        },
        rejected: {
            bg: "bg-red-100 dark:bg-red-900/20",
            text: "text-red-800 dark:text-red-200",
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
            <p className="text-base text-text-main dark:text-white font-medium wrap-break-word">
                {value || "—"}
            </p>
        </div>
    </div>
);

const ProfileTab = ({ profile, approvalStatus }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewingDoc, setViewingDoc] = useState(null);

    const isCredentialsLocked = approvalStatus === "pending" || approvalStatus === "review";

    const initials = profile?.fullName
        ? profile.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    const licenseTypeLabel =
        LICENSE_TYPES.find((lt) => lt.value === profile?.primaryLicenseType)?.label ||
        profile?.primaryLicenseType ||
        "—";

    const handleViewDocument = async (docId) => {
        setViewingDoc(docId);
        try {
            const res = await onboardingAPI.getDocumentUrl(docId);
            const url = res.data?.data?.url || res.data?.url;
            if (url) {
                window.open(url, "_blank");
            }
        } catch (err) {
            console.error("Error fetching document URL:", err);
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
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MdPerson className="text-primary text-xl" />
                                </div>
                                <h3 className="text-lg font-bold text-text-main dark:text-white">
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
                            {profile?.profilePhotoUrl ? (
                                <Image
                                    src={profile.profilePhotoUrl}
                                    alt={profile.fullName}
                                    width={96}
                                    height={96}
                                    className="w-24 h-24 rounded-full object-cover border-2 border-border-light dark:border-border-dark shrink-0"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border-light dark:border-border-dark shrink-0">
                                    <span className="text-primary text-2xl font-bold">
                                        {initials}
                                    </span>
                                </div>
                            )}
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
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MdWork className="text-primary text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white">
                                Professional Details
                            </h3>
                        </div>

                        {/* Credential lock notice for pending/review */}
                        {isCredentialsLocked && (
                            <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <MdLock className="text-yellow-600 dark:text-yellow-400 text-sm shrink-0" />
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                    Credential fields are locked while your application is under review. Contact support for changes.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                            <InfoRow label="Specialization" value={profile?.specialization} />
                            <InfoRow label="License Type" value={licenseTypeLabel} />
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
                            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                <p className="text-sm text-text-muted mb-1">Professional Summary</p>
                                <p className="text-sm text-text-main dark:text-white leading-relaxed whitespace-pre-wrap">
                                    {profile.professionalSummary}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Account Status */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-bold text-text-main dark:text-white mb-4">
                            Account Status
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Approval</span>
                                <StatusBadge status={profile?.approvalStatus} />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Onboarding</span>
                                <span
                                    className={`inline-flex items-center gap-1 text-xs font-semibold ${profile?.onboardingComplete
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-yellow-600 dark:text-yellow-400"
                                        }`}
                                >
                                    <MdCheckCircle className="text-sm" />
                                    {profile?.onboardingComplete ? "Complete" : "Incomplete"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Stripe</span>
                                <span
                                    className={`inline-flex items-center gap-1 text-xs font-semibold ${profile?.stripeOnboardingComplete
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-yellow-600 dark:text-yellow-400"
                                        }`}
                                >
                                    <MdCheckCircle className="text-sm" />
                                    {profile?.stripeOnboardingComplete ? "Connected" : "Not Connected"}
                                </span>
                            </div>
                        </div>

                        {/* Contextual status message for pending/review */}
                        {(approvalStatus === "pending" || approvalStatus === "review") && (
                            <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark">
                                <p className="text-xs text-text-muted dark:text-gray-400">
                                    Estimated review time: <span className="font-semibold text-text-main dark:text-white">24-48 hours</span>
                                </p>
                                <p className="text-xs text-text-muted dark:text-gray-400 mt-1">
                                    Your profile is hidden from patients until approved.
                                </p>
                            </div>
                        )}

                        {/* Contextual status message for rejected */}
                        {approvalStatus === "rejected" && (
                            <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800">
                                <p className="text-xs font-semibold text-red-700 dark:text-red-300">
                                    Action required — please update your credentials
                                </p>
                                {profile?.rejectionReason && (
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        {profile.rejectionReason}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* License Documents */}
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MdDescription className="text-primary text-xl" />
                            </div>
                            <h3 className="text-lg font-bold text-text-main dark:text-white">
                                License Documents
                            </h3>
                        </div>

                        {profile?.licenseDocuments?.length > 0 ? (
                            <div className="space-y-3">
                                {profile.licenseDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between bg-muted-light dark:bg-muted-dark rounded-lg p-3 border border-border-light dark:border-border-dark"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-text-main dark:text-white truncate">
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
                        {approvalStatus === "rejected" && (
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