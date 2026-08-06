"use client";

import { MdVerified, MdScience, MdGroups, MdAttachMoney, MdCalendarToday } from "react-icons/md";
import { formatShortDate } from "@/utils/dates";

/**
 * @param {string[]} items
 * @param {string} emptyText
 */
const BadgeList = ({ items, emptyText }) => {
    if (!items?.length) return <span className="text-sm text-text-muted">{emptyText}</span>;
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <span
                    key={item}
                    className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold"
                >
                    {item}
                </span>
            ))}
        </div>
    );
};

/**
 * @param {string} label
 * @param {React.ReactNode} children
 */
const DetailRow = ({ label, children }) => (
    <div className="py-2">
        <p className="text-sm text-text-muted mb-1">{label}</p>
        <div className="text-base text-text-main font-medium">{children}</div>
    </div>
);

/**
 * @param {string} label
 * @param {React.ReactNode} icon
 * @param {React.ReactNode} children
 */
const SectionCard = ({ label, icon, children }) => (
    <div className="bg-card-light border border-border-light rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
            <h3 className="text-lg font-bold text-text-main">{label}</h3>
        </div>
        {children}
    </div>
);

/**
 * Displays all new Phase-5 profile fields: clinical skills, clinical background,
 * expanded rates, availability extras, and HIPAA compliance status.
 *
 * @param {{ profile: object }} props
 */
export function ClinicalProfileSection({ profile }) {
    const hasRates =
        profile?.evaluationRate != null || profile?.travelFee != null;

    const hasAvailabilityExtras =
        profile?.availableFrom != null || profile?.caseloadCapacity != null;

    return (
        <div className="space-y-6">
            <SectionCard label="Clinical Skills" icon={<MdScience className="text-primary text-xl" />}>
                <div className="space-y-4">
                    <DetailRow label="Specialties">
                        <BadgeList items={profile?.specialties} emptyText="Not specified" />
                    </DetailRow>
                    <DetailRow label="Languages Spoken">
                        <BadgeList items={profile?.languages} emptyText="Not specified" />
                    </DetailRow>
                    <DetailRow label="Certifications">
                        <BadgeList items={profile?.certifications} emptyText="None listed" />
                    </DetailRow>
                </div>
            </SectionCard>

            <SectionCard label="Clinical Background" icon={<MdGroups className="text-primary text-xl" />}>
                <div className="space-y-4">
                    <DetailRow label="Past Clinical Settings">
                        <BadgeList items={profile?.pastSettings} emptyText="Not specified" />
                    </DetailRow>
                    <DetailRow label="Patient Population Experience">
                        <BadgeList items={profile?.populationExperience} emptyText="Not specified" />
                    </DetailRow>
                    {profile?.yearsInHomeHealth != null && (
                        <DetailRow label="Years in Home Health">
                            {profile.yearsInHomeHealth} {profile.yearsInHomeHealth === 1 ? "year" : "years"}
                        </DetailRow>
                    )}
                </div>
            </SectionCard>

            {hasRates && (
                <SectionCard label="Additional Rates" icon={<MdAttachMoney className="text-primary text-xl" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        {profile?.evaluationRate != null && (
                            <DetailRow label="Evaluation Rate">
                                ${parseFloat(profile.evaluationRate).toFixed(2)}
                            </DetailRow>
                        )}
                        {profile?.travelFee != null && (
                            <DetailRow label="Travel Fee">
                                ${parseFloat(profile.travelFee).toFixed(2)}
                            </DetailRow>
                        )}
                    </div>
                </SectionCard>
            )}

            {hasAvailabilityExtras && (
                <SectionCard label="Availability Details" icon={<MdCalendarToday className="text-primary text-xl" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        {profile?.availableFrom != null && (
                            <DetailRow label="Available From">
                                {formatShortDate(profile.availableFrom)}
                            </DetailRow>
                        )}
                        {profile?.caseloadCapacity != null && (
                            <DetailRow label="Max Patients / Week">
                                {profile.caseloadCapacity}
                            </DetailRow>
                        )}
                    </div>
                </SectionCard>
            )}

            <SectionCard label="Compliance" icon={<MdVerified className="text-primary text-xl" />}>
                <DetailRow label="HIPAA Training">
                    {profile?.hipaaAttested ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                            <MdVerified className="text-base" />
                            Attested
                            {profile.hipaaAttestedAt && (
                                <span className="text-text-muted font-normal text-sm">
                                    — {formatShortDate(profile.hipaaAttestedAt)}
                                </span>
                            )}
                        </span>
                    ) : (
                        <span className="text-text-muted">Not yet attested</span>
                    )}
                </DetailRow>
            </SectionCard>
        </div>
    );
}
