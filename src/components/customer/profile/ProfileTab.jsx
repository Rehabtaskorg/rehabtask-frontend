"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { APPROVAL_STATUS, CUSTOMER_TYPES } from "@/lib/constants";
import { ReReviewBanner } from "@/components/therapist/profile/ReReviewBanner";
import { ContactInfoCard } from "./cards/ContactInfoCard";
import { AddressCard } from "./cards/AddressCard";
import { BusinessInfoCard } from "./cards/BusinessInfoCard";
import { PersonalInfoCard } from "./cards/PersonalInfoCard";
import { MedicalInfoCard } from "./cards/MedicalInfoCard";
import { AccountStatusCard } from "./cards/AccountStatusCard";

const ContactInfoDrawer = dynamic(
    () => import("./drawers/ContactInfoDrawer").then((mod) => mod.ContactInfoDrawer),
    { ssr: false }
);
const AddressDrawer = dynamic(
    () => import("./drawers/AddressDrawer").then((mod) => mod.AddressDrawer),
    { ssr: false }
);
const BusinessInfoDrawer = dynamic(
    () => import("./drawers/BusinessInfoDrawer").then((mod) => mod.BusinessInfoDrawer),
    { ssr: false }
);
const MedicalInfoDrawer = dynamic(
    () => import("./drawers/MedicalInfoDrawer").then((mod) => mod.MedicalInfoDrawer),
    { ssr: false }
);
const LockedIdentityModal = dynamic(
    () => import("./LockedIdentityModal").then((mod) => mod.LockedIdentityModal),
    { ssr: false }
);

const PANELS = {
    CONTACT: "contact",
    ADDRESS: "address",
    BUSINESS: "business",
    MEDICAL: "medical",
    IDENTITY: "identity",
};

const SOFT_REVIEW_COPY = {
    title: "Changes submitted for review",
    body: "Your account carries on as normal — you can still book therapists, post requests and message as usual.",
};

const HARD_REVIEW_COPY = {
    title: "Your account is under review",
    body: "Booking therapists, posting new requests and starting new conversations are paused until a reviewer approves your changes. Visits already booked carry on as normal.",
};

/**
 * Customer profile tab. The only place `customerType` is branched on — the
 * shared cards below take a label rather than a type flag, and each edit panel
 * owns its own field policy.
 *
 * @param {Object} props
 * @param {Object} props.profile - Customer profile from `useCustomerProfile`.
 */
export function ProfileTab({ profile }) {
    const [openPanel, setOpenPanel] = useState(null);

    const closePanel = () => setOpenPanel(null);

    const isAgency = profile?.customerType === CUSTOMER_TYPES.AGENCY;
    const isLockedForReview = profile?.approvalStatus === APPROVAL_STATUS.REVIEW;
    const addressTitle = isAgency ? "Business Address" : "Home Address";

    return (
        <>
            <ReReviewBanner
                pendingReviewAt={profile?.pendingReviewAt}
                approvalStatus={profile?.approvalStatus}
                softCopy={SOFT_REVIEW_COPY}
                hardCopy={HARD_REVIEW_COPY}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {isAgency ? (
                        <BusinessInfoCard
                            profile={profile}
                            onEdit={() => setOpenPanel(PANELS.BUSINESS)}
                            onViewLockedIdentity={() => setOpenPanel(PANELS.IDENTITY)}
                        />
                    ) : (
                        <PersonalInfoCard
                            profile={profile}
                            onViewLockedIdentity={() => setOpenPanel(PANELS.IDENTITY)}
                        />
                    )}

                    <ContactInfoCard
                        profile={profile}
                        onEdit={() => setOpenPanel(PANELS.CONTACT)}
                    />

                    <AddressCard
                        profile={profile}
                        title={addressTitle}
                        isLockedForReview={isLockedForReview}
                        onEdit={() => setOpenPanel(PANELS.ADDRESS)}
                    />

                    {!isAgency && (
                        <MedicalInfoCard
                            profile={profile}
                            onEdit={() => setOpenPanel(PANELS.MEDICAL)}
                        />
                    )}
                </div>

                <div className="space-y-6">
                    <AccountStatusCard profile={profile} />
                </div>
            </div>

            <ContactInfoDrawer
                isOpen={openPanel === PANELS.CONTACT}
                onClose={closePanel}
                profile={profile}
            />
            {openPanel === PANELS.ADDRESS && (
                <AddressDrawer
                    isOpen
                    onClose={closePanel}
                    profile={profile}
                    title={`Edit ${addressTitle.toLowerCase()}`}
                />
            )}
            {isAgency && (
                <BusinessInfoDrawer
                    isOpen={openPanel === PANELS.BUSINESS}
                    onClose={closePanel}
                    profile={profile}
                />
            )}
            {!isAgency && (
                <MedicalInfoDrawer
                    isOpen={openPanel === PANELS.MEDICAL}
                    onClose={closePanel}
                    profile={profile}
                />
            )}
            <LockedIdentityModal
                isOpen={openPanel === PANELS.IDENTITY}
                onClose={closePanel}
                profile={profile}
                isDateOfBirthShown={!isAgency}
            />
        </>
    );
}
