"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useUpdateCustomerProfile } from "@/hooks/useCustomerProfile";
import { contactInfoSchema, pickChangedFields } from "@/lib/validators/customerProfileEdit.schema";

const FIELDS = ["phone"];

/**
 * Edit panel for the customer's phone number.
 *
 * `phone` is OPEN tier, so this save never triggers a re-review. The payload is
 * still narrowed through `pickChangedFields` for consistency with the other
 * drawers and to skip a pointless request when nothing changed.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the drawer.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Customer profile supplying default values.
 * @param {() => void} [props.onSuccess] - Called after a successful save.
 */
export function ContactInfoDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateProfile = useUpdateCustomerProfile();

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(contactInfoSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: { phone: profile?.phone || "" },
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
            title="Edit contact information"
            description="The number we use for appointment reminders."
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
                    <Button type="submit" form="contact-info-form" loading={updateProfile.isPending}>
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form id="contact-info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                <PhoneInput
                    label="Phone"
                    name="phone"
                    control={control}
                    error={errors.phone?.message}
                    required
                />

                <p className="text-xs text-text-muted">
                    Changing your number doesn&apos;t change your SMS preference. Turn reminders on
                    or off with the toggle on your profile.
                </p>
            </form>
        </Drawer>
    );
}
