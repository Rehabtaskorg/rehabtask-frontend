"use client";

import { useState } from "react";
import { MdArrowForward, MdBusiness, MdPerson } from "react-icons/md";
import { FaGoogle } from "react-icons/fa";
import Button from "@/components/ui/Button";
import { CUSTOMER_TYPE_OPTIONS } from "@/lib/constants";

const OPTION_ICONS = {
    MdPerson,
    MdBusiness,
};

/**
 * @param {object} props
 * @param {(customerType: string) => void} props.onSelect - Called with the chosen customer type when the user advances
 * @param {() => void} props.onGoogleSignup - Called when the Google sign-up button is pressed
 * @param {boolean} [props.isGoogleLoading] - Whether the Google OAuth round trip is in flight
 * @returns {JSX.Element}
 */
export const CustomerTypeStep = ({ onSelect, onGoogleSignup, isGoogleLoading = false }) => {
    const [selectedType, setSelectedType] = useState(null);

    const handleContinue = () => {
        if (selectedType) onSelect(selectedType);
    };

    return (
        <div className="max-w-md mx-auto w-full">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Step 1 of 2</p>
            <h2 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mt-2">
                Create Your Account
            </h2>

            <fieldset className="mt-8 border-0 p-0 m-0">
                <legend className="text-text-main text-lg font-bold leading-normal mb-4">
                    Who is this account for?
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CUSTOMER_TYPE_OPTIONS.map(({ value, label, icon }) => {
                        const Icon = OPTION_ICONS[icon];
                        const isSelected = selectedType === value;
                        return (
                            <label key={value} className="relative flex cursor-pointer">
                                <input
                                    type="radio"
                                    name="customerType"
                                    value={value}
                                    checked={isSelected}
                                    onChange={() => setSelectedType(value)}
                                    onClick={() => onSelect(value)}
                                    className="peer sr-only"
                                />
                                <span className={`flex w-full flex-col items-center gap-4 rounded-2xl border-2 bg-white p-8 text-center transition-all duration-150 shadow-sm hover:shadow-md hover:border-primary/40 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 ${isSelected ? "border-primary shadow-md" : "border-border-light"}`}>
                                    <span className={`flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-150 ${isSelected ? "bg-primary text-white" : "bg-primary/8 text-primary"}`}>
                                        <Icon className="text-2xl" aria-hidden="true" />
                                    </span>
                                    <span className={`text-base font-bold leading-snug transition-colors duration-150 ${isSelected ? "text-primary" : "text-text-main"}`}>
                                        {label}
                                    </span>
                                    {isSelected && (
                                        <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12" aria-hidden="true">
                                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </span>
                                    )}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </fieldset>

            <div className="pt-8">
                <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleContinue}
                    disabled={!selectedType}
                    className="group"
                >
                    <span>Continue</span>
                    <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            <div className="relative flex py-5 items-center">
                <div className="grow border-t border-border-subtle" />
                <span className="shrink mx-4 text-zinc-400 text-xs uppercase tracking-widest font-bold">
                    Or continue with
                </span>
                <div className="grow border-t border-border-subtle" />
            </div>

            <button
                type="button"
                onClick={onGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border border-border-subtle rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
                <FaGoogle className="w-5 h-5 text-[#4285F4]" aria-hidden="true" />
                <span className="text-sm font-semibold">{isGoogleLoading ? "Connecting..." : "Google"}</span>
            </button>
        </div>
    );
};
