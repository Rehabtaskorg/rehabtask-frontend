"use client";

import { MdWork, MdLock, MdEdit } from "react-icons/md";
import Button from "@/components/ui/Button";
import { LICENSE_TYPES } from "@/lib/constants/credentials";
import { InfoRow } from "./InfoRow";

const formatRate = (value) =>
    value != null ? `$${parseFloat(value).toFixed(2)}` : null;

/**
 * Rates and credential summary. Rates are editable inline via `onEditRates`;
 * credential fields are verified-hard and only reviewable through
 * `onViewCredentials`, which explains the change-request route.
 *
 * @param {Object} props
 * @param {Object} props.profile - Therapist profile from `useTherapistProfile`.
 * @param {boolean} props.isCredentialsLocked - True while the application is pending or under review.
 * @param {() => void} props.onEditRates - Opens the rates drawer.
 * @param {() => void} props.onViewCredentials - Opens the read-only credentials modal.
 */
export function ProfessionalDetailsCard({
    profile,
    isCredentialsLocked,
    onEditRates,
    onViewCredentials,
}) {
    const licenseTypeLabel =
        LICENSE_TYPES.find((lt) => lt.value === profile?.primaryLicenseType)?.label ||
        profile?.primaryLicenseType ||
        "—";

    const attemptedRateValue =
        profile?.attemptedVisitRate != null
            ? parseFloat(profile.attemptedVisitRate) === 0
                ? "$0.00 (no charge for no-shows)"
                : formatRate(profile.attemptedVisitRate)
            : "Not set";

    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <MdWork className="text-xl text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-text-main">Professional Details</h3>
                </div>
                <Button variant="outline" size="sm" onClick={onEditRates}>
                    <MdEdit className="text-base" />
                    Edit rates
                </Button>
            </div>

            {isCredentialsLocked && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <MdLock className="shrink-0 text-sm text-yellow-600" />
                    <p className="text-xs text-yellow-700">
                        Credential fields are locked while your application is under review. Contact support for changes.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <InfoRow label="Rate per Visit" value={formatRate(profile?.ratePerVisit)} />
                <InfoRow label="Attempted Visit Rate" value={attemptedRateValue} />
                <InfoRow label="Evaluation Rate" value={formatRate(profile?.evaluationRate) ?? "Not set"} />
                <InfoRow label="Travel Fee" value={formatRate(profile?.travelFee) ?? "Not set"} />
                <InfoRow label="Discipline type" value={licenseTypeLabel} icon={<MdLock className="text-sm" />} />
                <InfoRow label="License Number" value={profile?.licenseNumber} icon={<MdLock className="text-sm" />} />
                <InfoRow label="License State" value={profile?.licenseState} icon={<MdLock className="text-sm" />} />
                <InfoRow label="NPI Number" value={profile?.npiNumber} icon={<MdLock className="text-sm" />} />
            </div>

            <button
                type="button"
                onClick={onViewCredentials}
                className="mt-4 text-sm font-semibold text-primary underline transition-colors hover:text-primary/80"
            >
                View credentials or request a change
            </button>

            {/*
                Professional Summary (read-only) — HIDDEN (product decision, 2026-09-07).
                Data layer unchanged; only this render is hidden.
                To restore: uncomment this block as-is.

                {profile?.professionalSummary && (
                    <div className="mt-4 pt-4 border-t border-border-light ">
                        <p className="text-sm text-text-muted mb-1">Professional Summary</p>
                        <p className="text-sm text-text-main  leading-relaxed whitespace-pre-wrap">
                            {profile.professionalSummary}
                        </p>
                    </div>
                )}
            */}
        </div>
    );
}
