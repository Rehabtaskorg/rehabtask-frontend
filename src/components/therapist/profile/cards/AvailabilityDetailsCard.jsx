"use client";

import { MdCalendarToday, MdEdit } from "react-icons/md";
import Button from "@/components/ui/Button";
import { formatDateOnly } from "@/utils/dates";
import { InfoRow } from "./InfoRow";

export function AvailabilityDetailsCard({ profile, isOnboardingComplete, onEdit }) {
    const availableFrom = profile?.availableFrom;
    const caseloadCapacity = profile?.caseloadCapacity;

    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <MdCalendarToday className="text-xl text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-text-main">Availability Details</h3>
                        <p className="text-sm text-text-muted">
                            When you start taking patients, and how many you can see.
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

            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                <div>
                    <InfoRow
                        label="Available From"
                        value={availableFrom ? formatDateOnly(availableFrom) : null}
                    />
                    {!availableFrom && (
                        <p className="-mt-1 pb-2 text-xs text-text-muted">
                            Not set — patients see you as available immediately.
                        </p>
                    )}
                </div>

                <div>
                    <InfoRow
                        label="Max Patients / Week"
                        value={caseloadCapacity ?? null}
                    />
                    {caseloadCapacity == null && (
                        <p className="-mt-1 pb-2 text-xs text-text-muted">
                            Not set — no weekly limit recorded.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
