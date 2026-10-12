"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import { MultiSelectTagPicker } from "@/components/ui/MultiSelectTagPicker";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useUpdateAttributes } from "@/hooks/useTherapistProfile";
import { clinicalProfileSchema } from "@/lib/validators/therapistProfileEdit.schema";
import {
    THERAPIST_SPECIALTIES,
    THERAPIST_LANGUAGES,
    THERAPIST_CERTIFICATIONS,
    THERAPIST_PAST_SETTINGS,
    THERAPIST_POPULATIONS,
} from "@/lib/constants/therapistAttributes";

const GROUPS = [
    {
        name: "specialties",
        label: "Specialties",
        options: THERAPIST_SPECIALTIES,
        placeholder: "Add a specialty...",
        isRequired: true,
    },
    {
        name: "languages",
        label: "Languages Spoken",
        options: THERAPIST_LANGUAGES,
        placeholder: "Add a language...",
    },
    {
        name: "certifications",
        label: "Certifications",
        options: THERAPIST_CERTIFICATIONS,
        placeholder: "Add a certification...",
    },
    {
        name: "pastSettings",
        label: "Past Clinical Settings",
        options: THERAPIST_PAST_SETTINGS,
        placeholder: "Add a setting...",
    },
    {
        name: "populationExperience",
        label: "Patient Population Experience",
        options: THERAPIST_POPULATIONS,
        placeholder: "Add a population...",
    },
];

const FIELDS = GROUPS.map((group) => group.name);

const isSameSet = (a = [], b = []) =>
    a.length === b.length && [...a].sort().every((value, i) => value === [...b].sort()[i]);

export function ClinicalProfileDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateAttributes = useUpdateAttributes();

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(clinicalProfileSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            specialties: profile?.specialties ?? [],
            languages: profile?.languages ?? [],
            certifications: profile?.certifications ?? [],
            pastSettings: profile?.pastSettings ?? [],
            populationExperience: profile?.populationExperience ?? [],
        },
    });

    const onSubmit = async (data) => {
        setAlert(null);

        const isUnchanged = FIELDS.every((field) => isSameSet(data[field], profile?.[field]));

        if (isUnchanged) {
            onSuccess?.();
            onClose();
            return;
        }

        try {
            await updateAttributes.mutateAsync(data);
            onSuccess?.();
            onClose();
        } catch (err) {
            setAlert({
                type: "error",
                message: err.response?.data?.message || "Failed to update your clinical profile.",
            });
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit clinical profile"
            description="Your specialties, languages and clinical background."
            size={DRAWER_SIZES.MD}
            isDismissDisabled={updateAttributes.isPending}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={updateAttributes.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="clinical-profile-form"
                        loading={updateAttributes.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form id="clinical-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {GROUPS.map(({ name, label, options, placeholder, isRequired }) => (
                    <div key={name} className="flex flex-col gap-2">
                        <label className="block text-sm font-bold uppercase tracking-wide text-text-main">
                            {label}
                            {isRequired && <span className="ml-1 text-red-500">*</span>}
                        </label>
                        <Controller
                            name={name}
                            control={control}
                            render={({ field }) => (
                                <MultiSelectTagPicker
                                    options={options}
                                    selected={field.value}
                                    onAdd={(value) => field.onChange([...field.value, value])}
                                    onRemove={(value) =>
                                        field.onChange(field.value.filter((v) => v !== value))
                                    }
                                    placeholder={placeholder}
                                    error={errors[name]?.message}
                                />
                            )}
                        />
                    </div>
                ))}

            </form>
        </Drawer>
    );
}
