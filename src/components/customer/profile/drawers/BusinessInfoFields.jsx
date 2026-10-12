"use client";

import { MdWarningAmber } from "react-icons/md";
import Input from "@/components/ui/Input";

/**
 * The business information inputs plus the standing hard-tier warning, split
 * out so the drawer itself stays focused on submission behaviour.
 *
 * @param {Object} props
 * @param {import('react-hook-form').UseFormRegister} props.register - React Hook Form register.
 * @param {Object} props.errors - React Hook Form field errors.
 */
export function BusinessInfoFields({ register, errors }) {
    return (
        <>
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <MdWarningAmber
                    className="mt-0.5 shrink-0 text-base text-amber-600"
                    aria-hidden="true"
                />
                <p className="text-xs text-amber-800">
                    Changing your agency legal name or EIN sends your account back to review and
                    pauses booking and new messages until it&apos;s approved. Trading name and
                    billing email save straight away.
                </p>
            </div>

            <Input
                label="Agency Legal Name"
                placeholder="e.g. Northside Home Health LLC"
                error={errors.agencyName?.message}
                required
                {...register("agencyName")}
            />

            <Input
                label="EIN"
                placeholder="e.g. 12-3456789"
                error={errors.ein?.message}
                {...register("ein")}
            />

            <Input
                label="Trading Name (DBA) — optional"
                placeholder="e.g. Northside Care"
                error={errors.dbaName?.message}
                helperText="Updating this sends your account for a light re-review. Booking and messaging carry on as normal."
                {...register("dbaName")}
            />

            <Input
                label="Billing Email"
                type="email"
                placeholder="e.g. billing@northsidehealth.com"
                error={errors.billingEmail?.message}
                required
                {...register("billingEmail")}
            />
        </>
    );
}
