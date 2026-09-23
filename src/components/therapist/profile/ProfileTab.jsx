"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdScience } from "react-icons/md";
import { APPROVAL_STATUS } from "@/lib/constants";
import Button from "@/components/ui/Button";
import { ClinicalProfileSection } from "./ClinicalProfileSection";
import { ReReviewBanner } from "./ReReviewBanner";
import { ProfilePanels, PANELS } from "./ProfilePanels";
import { PersonalInfoCard } from "./cards/PersonalInfoCard";
import { ContactDetailsCard } from "./cards/ContactDetailsCard";
import { AvailabilityDetailsCard } from "./cards/AvailabilityDetailsCard";
import { ClinicalBackgroundCard } from "./cards/ClinicalBackgroundCard";
import { ProfessionalDetailsCard } from "./cards/ProfessionalDetailsCard";
import { AccountStatusCard } from "./cards/AccountStatusCard";
import { DocumentsCard } from "./cards/DocumentsCard";


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

                    <AvailabilityDetailsCard
                        profile={profile}
                        isOnboardingComplete={onboardingComplete}
                        onEdit={() => setOpenPanel(PANELS.AVAILABILITY)}
                    />

                    <ClinicalBackgroundCard
                        profile={profile}
                        isOnboardingComplete={onboardingComplete}
                        onEdit={() => setOpenPanel(PANELS.BACKGROUND)}
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
                            Edit clinical profile
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

            <ProfilePanels
                openPanel={openPanel}
                onClose={closePanel}
                profile={profile}
            />
        </>
    );
};

export default ProfileTab;
