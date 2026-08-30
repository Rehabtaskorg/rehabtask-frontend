"use client";

import { useState } from "react";
import { MdLock } from "react-icons/md";
import Button from "@/components/ui/Button";
import { STRIPE_BUSINESS_STRUCTURE } from "@/lib/constants";

const INDIVIDUAL_OPTIONS = [
    {
        value: STRIPE_BUSINESS_STRUCTURE.INDIVIDUAL,
        title: "Individual / Sole practitioner",
        description: "Your personal name, date of birth, and last 4 digits of your SSN. No separate business registration.",
    },
];

const BUSINESS_OPTIONS = [
    {
        value: STRIPE_BUSINESS_STRUCTURE.SOLE_PROPRIETORSHIP,
        title: "Sole proprietorship",
        description: "Your legal business name and EIN. You have a registered business name with a separate tax ID.",
    },
    {
        value: STRIPE_BUSINESS_STRUCTURE.SINGLE_MEMBER_LLC,
        title: "Single-member LLC",
        description: "Your personal name, date of birth, and last 4 digits of your SSN",
    },
    {
        value: STRIPE_BUSINESS_STRUCTURE.MULTI_MEMBER_LLC,
        title: "Multi-member LLC",
        description: "Your business name and EIN only — no personal SSN required",
    },
    {
        value: STRIPE_BUSINESS_STRUCTURE.PRIVATE_CORPORATION,
        title: "Corporation",
        description: "Your business name and EIN only — no personal SSN required",
    },
];

/**
 * Pre-screen that captures how the payee is registered before a Stripe Connect
 * account is created. The structure determines which verification fields Stripe
 * asks for, and cannot be changed after the account exists.
 *
 * @param {{ onConfirm: (structure: string) => void, showIndividual?: boolean, showBusiness?: boolean, isSubmitting?: boolean }} props
 * @returns {JSX.Element}
 */
export const StripeBusinessStructureStep = ({ onConfirm, showIndividual = true, showBusiness = true, isSubmitting = false }) => {
    const [selected, setSelected] = useState(null);

    const handleConfirm = () => {
        if (selected) onConfirm(selected);
    };

    const renderOption = ({ value, title, description }) => {
        const isSelected = selected === value;
        return (
            <label
                key={value}
                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border-light hover:border-primary/40"
                    }`}
            >
                <input
                    type="radio"
                    name="businessStructure"
                    value={value}
                    checked={isSelected}
                    onChange={() => setSelected(value)}
                    aria-describedby={`desc-${value}`}
                    className="sr-only"
                />
                <span
                    aria-hidden="true"
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${isSelected ? "border-primary" : "border-slate-300"
                        }`}
                >
                    {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </span>
                <span className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-text-main">{title}</span>
                    <span id={`desc-${value}`} className="text-xs text-text-muted leading-relaxed">
                        {description}
                    </span>
                </span>
            </label>
        );
    };

    return (
        <div className="bg-card-light border border-border-light rounded-xl p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-text-main mb-2">How are you registered?</h2>
                <p className="text-text-muted text-sm">
                    This determines what information you will be asked to verify. It cannot be changed later, so choose the option that matches your tax filing.
                </p>
            </div>

            <fieldset className="space-y-6">
                <legend className="sr-only">Business structure</legend>

                {showIndividual && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Individual</p>
                        {INDIVIDUAL_OPTIONS.map(renderOption)}
                    </div>
                )}

                {showBusiness && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Registered Business</p>
                        {BUSINESS_OPTIONS.map(renderOption)}
                    </div>
                )}
            </fieldset>

            <div className="mt-8">
                <Button fullWidth onClick={handleConfirm} disabled={!selected} loading={isSubmitting}>
                    Continue
                </Button>
            </div>

            <div className="flex items-center gap-2 text-text-muted text-xs mt-4 justify-center">
                <MdLock className="text-sm shrink-0" />
                <span>All financial data is encrypted and processed securely. RehabTask never stores your bank details.</span>
            </div>
        </div>
    );
};
