"use client";

import { MdArrowForward, MdInfo } from "react-icons/md";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { CustomerDetailsHeader } from "@/components/forms/CustomerDetailsHeader";
import { CUSTOMER_TYPES } from "@/lib/constants";

/**
 * Step 2 of customer registration — presentational account details form.
 *
 * Owns no state. All form methods and submission state are supplied by
 * CustomerRegistrationForm so values persist across account-type switches.
 *
 * @param {object} props
 * @param {string} props.customerType - Validated customer type, one of CUSTOMER_TYPES
 * @param {() => void} props.onChangeType - Returns the user to the type chooser
 * @param {import("react-hook-form").UseFormRegister<object>} props.register - RHF field registrar
 * @param {import("react-hook-form").Control<object>} props.control - RHF control for PhoneInput
 * @param {Record<string, { message?: string }>} props.errors - RHF formState errors
 * @param {import("react-hook-form").UseFormHandleSubmit<object>} props.handleSubmit - RHF submit wrapper
 * @param {(data: object) => Promise<void>} props.onSubmit - Validated submit handler
 * @param {boolean} props.isSubmitting - True while the registration request is in flight
 * @param {string | null} props.error - Registration error message to surface
 * @param {string | null} props.success - Registration success message to surface
 * @param {() => void} props.clearMessages - Dismisses the visible alert
 * @returns {JSX.Element}
 */
export const CustomerDetailsStep = ({
    customerType,
    onChangeType,
    register,
    control,
    errors,
    handleSubmit,
    onSubmit,
    isSubmitting,
    error,
    success,
    clearMessages,
}) => {
    const isAgency = customerType === CUSTOMER_TYPES.AGENCY;

    return (
        <div className="max-w-md mx-auto w-full">
            <CustomerDetailsHeader
                customerType={customerType}
                error={error}
                success={success}
                onClearMessages={clearMessages}
                onChangeType={onChangeType}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
                <Input
                    label={isAgency ? "Agency Contact Name" : "Full Name"}
                    placeholder={isAgency ? "e.g., John Smith (Agency Director)" : "e.g., John Doe"}
                    error={errors.fullName?.message}
                    {...register("fullName")}
                    required
                />

                {isAgency && (
                    <Input
                        label="Business Registration Name"
                        placeholder="e.g., Sunshine Home Health LLC"
                        error={errors.agencyName?.message}
                        {...register("agencyName")}
                        required
                    />
                )}

                <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g., john@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                    required
                />

                <PhoneInput
                    label="Phone Number"
                    control={control}
                    name="phone"
                    error={errors.phone?.message}
                    required
                />

                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="smsOptIn"
                        {...register("smsOptIn")}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="smsOptIn" className="text-sm text-text-muted leading-snug">
                        By checking this box, you agree to receive SMS appointment reminders and
                        notifications from RehabTask. Message and data rates may apply.
                        Reply STOP to opt out at any time.
                    </label>
                </div>

                <div className="space-y-1.5">
                    <PasswordInput
                        label="Password"
                        placeholder="••••••••"
                        error={errors.password?.message}
                        {...register("password")}
                        required
                    />
                    <p className="text-xs text-text-muted flex items-center gap-1">
                        <MdInfo className="text-sm" aria-hidden="true" />
                        Must be at least 8 characters with uppercase, lowercase, number, and symbol
                    </p>
                </div>

                <div className="pt-6">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="group"
                    >
                        <span>Create Account</span>
                        <MdArrowForward className="text-xl group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </form>
        </div>
    );
};
