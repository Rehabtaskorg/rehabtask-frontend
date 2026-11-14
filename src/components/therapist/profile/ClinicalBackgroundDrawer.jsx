"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { EmrSelect } from "@/components/ui/EmrSelect";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";
import { clinicalBackgroundSchema } from "@/lib/validators/therapistProfileEdit.schema";
import { pickChangedFields } from "@/lib/validators/pickChangedFields";

const FIELDS = ["yearsInHomeHealth", "emr", "emrOther"];

export function ClinicalBackgroundDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateProfile = useUpdateProfile();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(clinicalBackgroundSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            yearsInHomeHealth: profile?.yearsInHomeHealth ?? "",
            emr: profile?.emr ?? "",
            emrOther: profile?.emrOther ?? "",
        },
    });

    const onSubmit = async (data) => {
        setAlert(null);
        const payload = pickChangedFields(data, profile, FIELDS);

        if (Object.keys(payload).length === 0) {
            onSuccess?.();
            onClose();
            return;
        }

        try {
            await updateProfile.mutateAsync(payload);
            onSuccess?.();
            onClose();
        } catch (err) {
            setAlert({
                type: "error",
                message: err.response?.data?.message || "Failed to update your home health experience.",
            });
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit home health experience"
            description="How long you have worked in home health specifically."
            size={DRAWER_SIZES.MD}
            isDismissDisabled={updateProfile.isPending}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={updateProfile.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="clinical-background-form"
                        loading={updateProfile.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form
                id="clinical-background-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                <Input
                    label="Years in Home Health"
                    type="number"
                    min={0}
                    max={50}
                    placeholder="e.g. 3"
                    error={errors.yearsInHomeHealth?.message}
                    helperText="Updating this sends your profile for a light re-review. You stay visible and bookable."
                    {...register("yearsInHomeHealth")}
                />

                <EmrSelect
                    value={watch("emr")}
                    otherValue={watch("emrOther")}
                    onChange={(emr) => setValue("emr", emr, { shouldDirty: true })}
                    onOtherChange={(emrOther) => setValue("emrOther", emrOther, { shouldDirty: true })}
                    label="EMR System"
                    labelClassName="block text-sm font-medium text-text-main mb-1.5"
                    selectClassName="w-full rounded-xl border border-border-light px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary"
                    inputClassName="w-full rounded-xl border border-border-light px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary"
                />
            </form>
        </Drawer>
    );
}
