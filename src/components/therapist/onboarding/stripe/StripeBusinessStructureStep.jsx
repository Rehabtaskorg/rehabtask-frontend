"use client";

import { useState } from "react";
import { MdLock } from "react-icons/md";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { StripeStructureOption } from "./StripeStructureOption";
import { STRIPE_BUSINESS_STRUCTURE, PRODUCT_DESCRIPTION_MIN_LENGTH, PRODUCT_DESCRIPTION_MAX_LENGTH } from "@/lib/constants";

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
 * Pre-screen that captures how the payee is registered and, optionally, a short
 * product description before a Stripe Connect account is created.
 *
 * @param {{
 *   onConfirm: (structure: string, productDescription?: string) => void,
 *   onSkip?: () => void,
 *   showIndividual?: boolean,
 *   showBusiness?: boolean,
 *   showProductDescription?: boolean,
 *   isSubmitting?: boolean
 * }} props
 * @returns {JSX.Element}
 */
export const StripeBusinessStructureStep = ({
    onConfirm,
    onSkip = null,
    showIndividual = true,
    showBusiness = true,
    showProductDescription = false,
    isSubmitting = false,
}) => {
    const [selected, setSelected] = useState(null);
    const [description, setDescription] = useState("");
    const [descriptionTouched, setDescriptionTouched] = useState(false);

    const descriptionTrimmed = description.trim();
    const descriptionTooShort = descriptionTrimmed.length < PRODUCT_DESCRIPTION_MIN_LENGTH;
    const descriptionError = descriptionTouched && descriptionTooShort
        ? `Please describe your services in at least ${PRODUCT_DESCRIPTION_MIN_LENGTH} characters.`
        : null;

    const isContinueDisabled =
        !selected || (showProductDescription && descriptionTooShort);

    const handleConfirm = () => {
        if (isContinueDisabled) return;
        onConfirm(selected, showProductDescription ? descriptionTrimmed : undefined);
    };

    return (
        <div className="bg-card-light border border-border-light rounded-xl p-8 shadow-sm">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-text-main mb-2">How are you registered?</h2>
                <p className="text-text-muted text-sm">
                    This determines what information you will be asked to verify. Choose the option that matches how you file taxes. If you need to change this later, contact support.
                </p>
            </div>

            <fieldset className="space-y-6">
                <legend className="sr-only">Business structure</legend>

                {showIndividual && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Individual</p>
                        {INDIVIDUAL_OPTIONS.map((opt) => (
                            <StripeStructureOption
                                key={opt.value}
                                {...opt}
                                isSelected={selected === opt.value}
                                onChange={setSelected}
                            />
                        ))}
                    </div>
                )}

                {showBusiness && (
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Registered Business</p>
                        {BUSINESS_OPTIONS.map((opt) => (
                            <StripeStructureOption
                                key={opt.value}
                                {...opt}
                                isSelected={selected === opt.value}
                                onChange={setSelected}
                            />
                        ))}
                    </div>
                )}
            </fieldset>

            {showProductDescription && (
                <div className="mt-6">
                    <Textarea
                        label="What services do you provide?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onBlur={() => setDescriptionTouched(true)}
                        rows={3}
                        maxLength={PRODUCT_DESCRIPTION_MAX_LENGTH}
                        placeholder="Outpatient physical therapy services for adults, including post-surgical rehabilitation and mobility training."
                        helperText="Briefly describe the therapy services you offer. This appears on your payment account and helps our payments processor verify your practice."
                        error={descriptionError}
                        aria-invalid={!!descriptionError}
                    />
                </div>
            )}

            <div className="mt-8">
                <Button fullWidth onClick={handleConfirm} disabled={isContinueDisabled} loading={isSubmitting}>
                    Continue
                </Button>

                {onSkip && (
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={onSkip}
                            className="text-text-muted hover:text-text-main text-sm font-semibold transition-colors"
                        >
                            I&apos;ll set this up later
                        </button>
                        <p className="text-xs text-text-muted mt-1">
                            You can set up payouts anytime from Payment Settings. This won&apos;t delay your review.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 text-text-muted text-xs mt-4 justify-center">
                <MdLock className="text-sm shrink-0" />
                <span>All financial data is encrypted and processed securely. RehabTask never stores your bank details.</span>
            </div>
        </div>
    );
};