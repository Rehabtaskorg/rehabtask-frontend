"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { MdScience } from "react-icons/md";
import { APPROVAL_STATUS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { ClinicalProfileSection } from "./ClinicalProfileSection";
import { ReReviewBanner } from "./ReReviewBanner";
import { PersonalInfoCard } from "./cards/PersonalInfoCard";
import { ContactDetailsCard } from "./cards/ContactDetailsCard";
import { ProfessionalDetailsCard } from "./cards/ProfessionalDetailsCard";
import { AccountStatusCard } from "./cards/AccountStatusCard";
import { DocumentsCard } from "./cards/DocumentsCard";

const PersonalInfoDrawer = dynamic(
    () => import("./PersonalInfoDrawer").then((mod) => mod.PersonalInfoDrawer),
    { ssr: false }
);
const RatesDrawer = dynamic(
    () => import("./RatesDrawer").then((mod) => mod.RatesDrawer),
    { ssr: false }
);
const ContactDetailsDrawer = dynamic(
    () => import("./ContactDetailsDrawer").then((mod) => mod.ContactDetailsDrawer),
    { ssr: false }
);
const CredentialsEditModal = dynamic(
    () => import("./CredentialsEditModal").then((mod) => mod.CredentialsEditModal),
    { ssr: false }
);
const ClinicalSkillsEditModal = dynamic(
    () => import("./ClinicalSkillsEditModal").then((mod) => mod.ClinicalSkillsEditModal),
    { ssr: false }
);

const PANELS = {
    PERSONAL: "personal",
    CONTACT: "contact",
    RATES: "rates",
    CREDENTIALS: "credentials",
    CLINICAL: "clinical",
};

/**
 * Therapist profile tab. Composes the profile cards and owns which edit panel
 * is open; all field-level behaviour lives in the cards and panels themselves.
 *
 * @param {Object} props
 * @param {Object} props.profile - Therapist profile from `useTherapistProfile`.
 * @param {string} props.approvalStatus - Current `APPROVAL_STATUS` value.
 * @param {boolean} props.onboardingComplete - Whether the onboarding wizard has been submitted.
 */
const ProfileTab = ({ profile, approvalStatus, onboardingComplete }) => {
    const [openPanel, setOpenPanel] = useState(null);
    const router = useRouter();

    const closePanel = () => setOpenPanel(null);

    const isCredentialsLocked =
        onboardingComplete &&
        (approvalStatus === APPROVAL_STATUS.PENDING || approvalStatus === APPROVAL_STATUS.REVIEW);

    return (
        <>
            <ReReviewBanner
                pendingReviewAt={profile?.pendingReviewAt}
                approvalStatus={approvalStatus}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <PersonalInfoCard
                        profile={profile}
                        isOnboardingComplete={onboardingComplete}
                        onEdit={() => setOpenPanel(PANELS.PERSONAL)}
                    />

                    <ContactDetailsCard
                        profile={profile}
                        isOnboardingComplete={onboardingComplete}
                        onEdit={() => setOpenPanel(PANELS.CONTACT)}
                    />

                    <ProfessionalDetailsCard
                        profile={profile}
                        isCredentialsLocked={isCredentialsLocked}
                        onEditRates={() => setOpenPanel(PANELS.RATES)}
                        onViewCredentials={() => setOpenPanel(PANELS.CREDENTIALS)}
                    />

                    <div className="space-y-2">
                        <ClinicalProfileSection profile={profile} />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpenPanel(PANELS.CLINICAL)}
                        >
                            <MdScience className="text-base" />
                            View clinical profile
                        </Button>
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
            <ContactDetailsDrawer
                isOpen={openPanel === PANELS.CONTACT}
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
