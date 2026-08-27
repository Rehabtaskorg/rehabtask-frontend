"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerTypeStep } from "@/components/forms/CustomerTypeStep";
import { CustomerDetailsStep } from "@/components/forms/CustomerDetailsStep";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useCustomerRegistration } from "@/hooks/useCustomerRegistration";
import { customerRegistrationSchema } from "@/lib/validators/therapist.schema";
import { AUTH_REDIRECT_PARAM, CUSTOMER_TYPES } from "@/lib/constants";

const CUSTOMER_TYPE_PARAM = "type";
const VALID_CUSTOMER_TYPES = Object.values(CUSTOMER_TYPES);

/**
 * @returns {JSX.Element}
 */
export const CustomerRegistrationForm = () => {
    usePageTitle("Create Account");
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirectTo = searchParams.get(AUTH_REDIRECT_PARAM) || null;
    const typeParam = searchParams.get(CUSTOMER_TYPE_PARAM);
    const customerType = VALID_CUSTOMER_TYPES.includes(typeParam) ? typeParam : null;

    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const { initiateGoogleLogin } = useGoogleAuth(redirectTo);

    const { register, control, handleSubmit, setValue, clearErrors, formState: { errors } } = useForm({
        resolver: zodResolver(customerRegistrationSchema),
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: {
            customerType: customerType ?? CUSTOMER_TYPES.INDIVIDUAL,
            fullName: "",
            email: "",
            phone: "",
            smsOptIn: false,
            password: "",
            agencyName: "",
        },
    });

    const { registerCustomer, isSubmitting, error, success, clearMessages } = useCustomerRegistration(redirectTo);

    useEffect(() => {
        if (!customerType) return;
        setValue("customerType", customerType, { shouldValidate: false });
        if (customerType !== CUSTOMER_TYPES.AGENCY) {
            setValue("agencyName", "", { shouldValidate: false });
            clearErrors("agencyName");
        }
    }, [customerType, setValue, clearErrors]);

    const onSubmit = async (data) => {
        await registerCustomer({
            ...data,
            agencyName: data.customerType === CUSTOMER_TYPES.AGENCY ? data.agencyName : null,
        });
    };

    const handleSelectType = (selectedType) => {
        const params = new URLSearchParams();
        params.set(CUSTOMER_TYPE_PARAM, selectedType);
        if (redirectTo) params.set(AUTH_REDIRECT_PARAM, redirectTo);
        router.push(`/register/customer?${params.toString()}`);
    };

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true);
        const result = await initiateGoogleLogin();
        if (!result?.success) setIsGoogleLoading(false);
    };

    if (!customerType) {
        return (
            <CustomerTypeStep
                onSelect={handleSelectType}
                onGoogleSignup={handleGoogleSignup}
                isGoogleLoading={isGoogleLoading}
            />
        );
    }

    return (
        <CustomerDetailsStep
            customerType={customerType}
            onChangeType={router.back}
            register={register}
            control={control}
            errors={errors}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            error={error}
            success={success}
            clearMessages={clearMessages}
        />
    );
};
