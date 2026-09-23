"use client";

import dynamic from "next/dynamic";

const PersonalInfoDrawer = dynamic(
    () => import("./PersonalInfoDrawer").then((mod) => mod.PersonalInfoDrawer),
    { ssr: false }
);
const ContactDetailsDrawer = dynamic(
    () => import("./ContactDetailsDrawer").then((mod) => mod.ContactDetailsDrawer),
    { ssr: false }
);
const AvailabilityDetailsDrawer = dynamic(
    () => import("./AvailabilityDetailsDrawer").then((mod) => mod.AvailabilityDetailsDrawer),
    { ssr: false }
);
const RatesDrawer = dynamic(
    () => import("./RatesDrawer").then((mod) => mod.RatesDrawer),
    { ssr: false }
);
const CredentialsEditModal = dynamic(
    () => import("./CredentialsEditModal").then((mod) => mod.CredentialsEditModal),
    { ssr: false }
);
const ClinicalProfileDrawer = dynamic(
    () => import("./ClinicalProfileDrawer").then((mod) => mod.ClinicalProfileDrawer),
    { ssr: false }
);

export const PANELS = {
    PERSONAL: "personal",
    CONTACT: "contact",
    AVAILABILITY: "availability",
    RATES: "rates",
    CREDENTIALS: "credentials",
    CLINICAL: "clinical",
};

/**
 * Edit panels for the therapist profile tab.
 *
 * Form-bearing drawers are mounted conditionally so they remount on each open
 * and never show values from a previous session.
 *
 * @param {Object} props
 * @param {string|null} props.openPanel - Which `PANELS` value is open.
 * @param {() => void} props.onClose - Closes the open panel.
 * @param {Object} props.profile - Therapist profile passed to every panel.
 */
export function ProfilePanels({ openPanel, onClose, profile }) {
    return (
        <>
            <PersonalInfoDrawer
                isOpen={openPanel === PANELS.PERSONAL}
                onClose={onClose}
                profile={profile}
                onSuccess={onClose}
            />
            {openPanel === PANELS.CONTACT && (
                <ContactDetailsDrawer
                    isOpen
                    onClose={onClose}
                    profile={profile}
                    onSuccess={onClose}
                />
            )}
            {openPanel === PANELS.AVAILABILITY && (
                <AvailabilityDetailsDrawer
                    isOpen
                    onClose={onClose}
                    profile={profile}
                    onSuccess={onClose}
                />
            )}
            {openPanel === PANELS.CLINICAL && (
                <ClinicalProfileDrawer
                    isOpen
                    onClose={onClose}
                    profile={profile}
                    onSuccess={onClose}
                />
            )}
            <RatesDrawer
                isOpen={openPanel === PANELS.RATES}
                onClose={onClose}
                profile={profile}
                onSuccess={onClose}
            />
            <CredentialsEditModal
                isOpen={openPanel === PANELS.CREDENTIALS}
                onClose={onClose}
                profile={profile}
            />
        </>
    );
}
