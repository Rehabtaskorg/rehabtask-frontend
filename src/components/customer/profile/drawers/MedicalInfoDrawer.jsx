"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useUpdateCustomerProfile } from "@/hooks/useCustomerProfile";
import { medicalInfoSchema, pickChangedFields } from "@/lib/validators/customerProfileEdit.schema";

const FIELDS = ["primaryDiagnosis", "referringProviderName"];

/**
 * Edit panel for an individual customer's medical details.
 *
 * Both fields are VERIFIED_SOFT: saving sends the account for a light
 * re-review, which does not suspend bookings or messaging. Only changed fields
 * are submitted, so correcting the referring provider alone never re-submits
 * the diagnosis.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the drawer.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Customer profile supplying default values.
 * @param {() => void} [props.onSuccess] - Called after a successful save.
 */
export function MedicalInfoDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateProfile = useUpdateCustomerProfile();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(medicalInfoSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            primaryDiagnosis: profile?.primaryDiagnosis || "",
            referringProviderName: profile?.referringProviderName || "",
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
            setAlert({ type: "error", message: err.message });
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit medical information"
            description="Helps us match you with the right therapist."
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
                    <Button type="submit" form="medical-info-form" loading={updateProfile.isPending}>
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form id="medical-info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                <Input
                    label="Primary Diagnosis"
                    placeholder="e.g. Post-operative knee replacement"
                    error={errors.primaryDiagnosis?.message}
                    helperText="Updating this sends your account for a light re-review. Your bookings and messages are unaffected."
                    required
                    {...register("primaryDiagnosis")}
                />

                <Input
                    label="Referring Provider — optional"
                    placeholder="e.g. Dr. Alex Morgan"
                    error={errors.referringProviderName?.message}
                    {...register("referringProviderName")}
                />
            </form>
        </Drawer>
    );
}
