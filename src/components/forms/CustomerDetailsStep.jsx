"use client";

import { MdArrowForward, MdInfo } from "react-icons/md";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import { CustomerDetailsHeader } from "@/components/forms/CustomerDetailsHeader";
import { useCustomerRegistration } from "@/hooks/useCustomerRegistration";
import { customerRegistrationSchema } from "@/lib/validators/therapist.schema";
import { CUSTOMER_TYPES } from "@/lib/constants";

/**
 * Step 2 of customer registration — the account details form.
 *
 * The account type is fixed by the caller (derived from the validated URL param)
 * and seeded into React Hook Form as the single source of truth for `customerType`.
 *
 * @param {object} props
 * @param {string} props.customerType - Validated customer type from the URL, one of CUSTOMER_TYPES
 * @param {string | null} [props.redirectTo] - Encoded `trigger:entityId` descriptor to resume after verification
 * @param {() => void} props.onChangeType - Called when the user wants to return to the type chooser
 * @returns {JSX.Element}
 */
export const CustomerDetailsStep = ({ customerType, redirectTo = null, onChangeType }) => {
    const isAgency = customerType === CUSTOMER_TYPES.AGENCY;

    const { register, handleSubmit, formState: { errors }, control } = useForm({
        resolver: zodResolver(customerRegistrationSchema),
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: {
            customerType,
            fullName: "",
            email: "",
            phone: "",
            smsOptIn: false,
            password: "",
            agencyName: "",
        },
    });

    const { registerCustomer, isSubmitting, error, success, clearMessages } = useCustomerRegistration(redirectTo);

    const onSubmit = async (data) => {
        await registerCustomer({
            ...data,
            agencyName: data.customerType === CUSTOMER_TYPES.AGENCY ? data.agencyName : null,
        });
    };

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
                <input type="hidden" {...register("customerType")} />

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
