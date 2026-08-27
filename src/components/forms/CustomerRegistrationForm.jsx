"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerTypeStep } from "@/components/forms/CustomerTypeStep";
import { CustomerDetailsStep } from "@/components/forms/CustomerDetailsStep";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
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
            redirectTo={redirectTo}
            onChangeType={router.back}
        />
    );
};
