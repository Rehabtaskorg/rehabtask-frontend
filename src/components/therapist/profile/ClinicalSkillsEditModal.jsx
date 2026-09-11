"use client";

import { MdScience, MdMailOutline } from "react-icons/md";
import { Modal, MODAL_SIZES } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Badge, BADGE_VARIANTS } from "@/components/ui/Badge";

const SUPPORT_EMAIL = "support@rehabtask.com";
const SUPPORT_SUBJECT = "Clinical profile change request";

/**
 * @param {Object} props
 * @param {string} props.label - Attribute group name.
 * @param {string[]} [props.items] - Attribute values.
 * @param {string} props.emptyText - Shown when the group is empty.
 */
function AttributeGroup({ label, items, emptyText }) {
    return (
        <div>
            <p className="mb-1.5 text-sm text-text-muted">{label}</p>
            {items?.length ? (
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <Badge key={item} variant={BADGE_VARIANTS.INFO}>
                            {item}
                        </Badge>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-text-muted">{emptyText}</p>
            )}
        </div>
    );
}

/**
 * Read-only view of the clinical attributes rendered by `ClinicalProfileSection`,
 * with the supported route for changing them.
 *
 * None of these groups are self-editable in this phase: the attribute arrays are
 * absent from the backend field policy, so `updateTherapistProfile` rejects them
 * as unknown fields, and their only writer (the onboarding wizard) is closed
 * once an application reaches review or approval. Changes go through support.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the modal.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Therapist profile supplying the attribute arrays.
 */
export function ClinicalSkillsEditModal({ isOpen, onClose, profile }) {
    const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Clinical profile"
            icon={<MdScience className="text-xl text-primary" aria-hidden="true" />}
            size={MODAL_SIZES.XL}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                    <a
                        href={mailtoHref}
                        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
                    >
                        <MdMailOutline className="text-base" aria-hidden="true" />
                        Request a change
                    </a>
                </div>
            }
        >
            <div className="space-y-5">
                <p className="rounded-lg border border-border-light bg-muted-light p-3 text-xs text-text-muted">
                    Your clinical profile is set during onboarding and reviewed alongside your
                    credentials, so it can&apos;t be edited here yet. Email support and a reviewer
                    will update it for you.
                </p>

                <AttributeGroup
                    label="Specialties"
                    items={profile?.specialties}
                    emptyText="Not specified"
                />
                <AttributeGroup
                    label="Languages Spoken"
                    items={profile?.languages}
                    emptyText="Not specified"
                />
                <AttributeGroup
                    label="Certifications"
                    items={profile?.certifications}
                    emptyText="None listed"
                />
                <AttributeGroup
                    label="Past Clinical Settings"
                    items={profile?.pastSettings}
                    emptyText="Not specified"
                />
                <AttributeGroup
                    label="Patient Population Experience"
                    items={profile?.populationExperience}
                    emptyText="Not specified"
                />

                {profile?.yearsInHomeHealth != null && (
                    <div>
                        <p className="mb-1.5 text-sm text-text-muted">Years in Home Health</p>
                        <p className="text-base font-medium text-text-main">
                            {profile.yearsInHomeHealth}{" "}
                            {profile.yearsInHomeHealth === 1 ? "year" : "years"}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
