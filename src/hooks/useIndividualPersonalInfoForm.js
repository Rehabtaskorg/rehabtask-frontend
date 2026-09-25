"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { individualPersonalInfoSchema } from "@/lib/validators/individual.onboarding.schema";
import { individualOnboardingAPI } from "@/services/onboarding.individual.api";
import useIndividualOnboardingStore from "@/stores/individualOnboardingStore";
import { logger } from "@/lib/logger";

/**
 * @returns {{ ready: boolean, register: Function, handleSubmit: Function, errors: object, setValue: Function, addressLine1Display: string, setAddressLine1Display: Function, handleAddressSelect: Function, handleAddressClear: Function, registration: object, loading: boolean, submitError: string|null, onSubmit: Function }}
 */
export function useIndividualPersonalInfoForm() {
    const router = useRouter();
    const updatePersonalInfo = useIndividualOnboardingStore((s) => s.updatePersonalInfo);
    const markStepComplete = useIndividualOnboardingStore((s) => s.markStepComplete);
    const setCurrentStep = useIndividualOnboardingStore((s) => s.setCurrentStep);

    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [registration, setRegistration] = useState({ fullName: "", phone: "", email: "" });
    const [initialValues, setInitialValues] = useState({
        dateOfBirth: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
    });
    const [addressLine1Display, setAddressLine1Display] = useState("");

    useEffect(() => {
        individualOnboardingAPI
            .getIndividualOnboardingData()
            .then((res) => {
                const data = res.data.data;
                if (data.registration) setRegistration(data.registration);
                const pi = data.personalInfo;
                if (pi) {
                    const vals = {
                        dateOfBirth: pi.dateOfBirth || "",
                        addressLine1: pi.addressLine1 || "",
                        addressLine2: pi.addressLine2 || "",
                        city: pi.city || "",
                        state: pi.state || "",
                        zipCode: pi.zipCode || "",
                    };
                    setInitialValues(vals);
                    setAddressLine1Display(pi.addressLine1 || "");
                }
            })
            .catch((err) => logger.error("Failed to load individual onboarding data:", err))
            .finally(() => setReady(true));
    }, []);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(individualPersonalInfoSchema),
        defaultValues: initialValues,
        mode: "onSubmit",
    });

    useEffect(() => {
        if (ready) {
            Object.entries(initialValues).forEach(([key, val]) => {
                setValue(key, val);
            });
            setAddressLine1Display(initialValues.addressLine1);
        }
    }, [ready, initialValues, setValue]);

    const handleAddressSelect = ({ formattedAddress, city, state, zipCode }) => {
        setAddressLine1Display(formattedAddress);
        setValue("addressLine1", formattedAddress, { shouldValidate: false });
        setValue("city", city, { shouldValidate: false });
        setValue("state", state, { shouldValidate: false });
        setValue("zipCode", zipCode, { shouldValidate: false });
    };

    const handleAddressClear = () => {
        setAddressLine1Display("");
        ["addressLine1", "city", "state", "zipCode"].forEach((f) =>
            setValue(f, "", { shouldValidate: false })
        );
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setSubmitError(null);
        try {
            const payload = {
                dateOfBirth: data.dateOfBirth,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || null,
                city: data.city,
                state: data.state,
                zipCode: data.zipCode,
            };
            await individualOnboardingAPI.savePersonalInfo(payload);
            updatePersonalInfo(payload);
            markStepComplete(2);
            setCurrentStep(3);
            router.push("/customer/onboarding/individual/medical-info");
        } catch (err) {
            logger.error("Failed to save individual personal info:", err);
            setSubmitError(
                err.response?.data?.message || "Failed to save personal information. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        ready,
        register,
        handleSubmit,
        errors,
        setValue,
        addressLine1Display,
        setAddressLine1Display,
        handleAddressSelect,
        handleAddressClear,
        registration,
        loading,
        submitError,
        onSubmit,
    };
}