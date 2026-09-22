"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import { AddressFields } from "@/components/ui/AddressFields";
import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";
import { contactDetailsSchema } from "@/lib/validators/therapistProfileEdit.schema";
import { pickChangedFields } from "@/lib/validators/pickChangedFields";

const FIELDS = [
    "addressLine1",
    "addressLine2",
    "city",
    "state",
    "zipCode",
    "emergencyContactName",
    "emergencyContactPhone",
];

export function ContactDetailsDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateProfile = useUpdateProfile();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(contactDetailsSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            addressLine1: profile?.addressLine1 || "",
            addressLine2: profile?.addressLine2 || "",
            city: profile?.city || "",
            state: profile?.state || "",
            zipCode: profile?.zipCode || "",
            emergencyContactName: profile?.emergencyContactName || "",
            emergencyContactPhone: profile?.emergencyContactPhone || "",
        },
    });

    const onSubmit = async (data) => {
        setAlert(null);
        const payload = pickChangedFields(data, profile, FIELDS);

        if (Object.keys(payload).length === 0) {
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
                message: err.response?.data?.message || "Failed to update your details.",
            });
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit contact & address"
            description="Your home address and who we contact in an emergency."
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
                        form="contact-details-form"
                        loading={updateProfile.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form id="contact-details-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                <AddressFields
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    idPrefix="therapist"
                    defaultAddressLine1={profile?.addressLine1 || ""}
                />

                <div className="space-y-5 border-t border-border-light pt-5">
                    <div>
                        <h4 className="text-sm font-bold text-text-main">Emergency Contact</h4>
                        <p className="mt-0.5 text-xs text-text-muted">
                            Who we call if something happens during a visit. Optional, but
                            strongly recommended.
                        </p>
                    </div>

                    <Input
                        label="Contact Name"
                        placeholder="e.g. Jane Doe"
                        error={errors.emergencyContactName?.message}
                        {...register("emergencyContactName")}
                    />

                    <PhoneInput
                        label="Contact Phone"
                        name="emergencyContactPhone"
                        control={control}
                        error={errors.emergencyContactPhone?.message}
                    />
                </div>
            </form>
        </Drawer>
    );
}
