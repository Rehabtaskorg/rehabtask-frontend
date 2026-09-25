"use client";

import { MdPerson, MdEdit } from "react-icons/md";
import Button from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import { InfoRow } from "./InfoRow";
import { SmsOptInToggle } from "./SmsOptInToggle";

/**
 * Identity and contact block: photo, name, email, phone, SMS preference and
 * years of experience. Editing is delegated upward via `onEdit`; the SMS
 * toggle stays inline because it saves immediately rather than through a form.
 *
 * @param {Object} props
 * @param {Object} props.profile - Therapist profile from `useTherapistProfile`.
 * @param {boolean} props.isOnboardingComplete - Gates the SMS toggle.
 * @param {() => void} props.onEdit - Opens the personal information drawer.
 */
export function PersonalInfoCard({ profile, isOnboardingComplete, onEdit }) {
    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <MdPerson className="text-xl text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-text-main">Personal Information</h3>
                </div>
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <MdEdit className="text-base" />
                    Edit
                </Button>
            </div>

            <div className="mb-5 flex flex-col items-start gap-5 sm:flex-row">
                <UserAvatar
                    name={profile?.fullName}
                    photoUrl={profile?.profilePhotoUrl}
                    size="xl"
                    className="border-2 border-border-light"
                />
                <div className="min-w-0 flex-1 space-y-1">
                    <InfoRow label="Full Name" value={profile?.fullName} />
                    <InfoRow
                        label="Email"
                        value={
                            profile?.email ? (
                                <span className="flex flex-col gap-0.5">
                                    <span>{profile.email}</span>
                                    <span className="text-xs font-normal text-text-muted">
                                        Shared with customers after a booking is confirmed
                                    </span>
                                </span>
                            ) : null
                        }
                    />
                    <InfoRow label="Phone" value={profile?.phone} />
                    <SmsOptInToggle
                        profile={profile}
                        isOnboardingComplete={isOnboardingComplete}
                    />
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
    );
}
