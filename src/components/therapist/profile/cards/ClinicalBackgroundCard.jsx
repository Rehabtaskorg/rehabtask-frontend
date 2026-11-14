"use client";

import { MdGroups, MdEdit } from "react-icons/md";
import Button from "@/components/ui/Button";
import { InfoRow } from "./InfoRow";

export function ClinicalBackgroundCard({ profile, isOnboardingComplete, onEdit }) {
    const years = profile?.yearsInHomeHealth;
    const emrValue =
        (profile?.emr === "Other" ? profile?.emrOther : profile?.emr) || "Not set";

    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <MdGroups className="text-xl text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-main">Practice Details</h3>
                        <p className="text-sm text-text-muted">
                            Your home health experience and the EMR system you work in.
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    disabled={!isOnboardingComplete}
                >
                    <MdEdit className="text-base" />
                    Edit
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <InfoRow
                    label="Years in Home Health"
                    value={years != null ? `${years} ${years === 1 ? "year" : "years"}` : "Not set"}
                />
                <InfoRow label="EMR System" value={emrValue} />
            </div>
        </div>
    );
}
