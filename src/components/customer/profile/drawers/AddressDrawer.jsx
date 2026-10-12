"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useUpdateCustomerProfile } from "@/hooks/useCustomerProfile";
import { addressSchema, pickChangedFields } from "@/lib/validators/customerProfileEdit.schema";
import { AddressFields } from "@/components/ui/AddressFields";

const FIELDS = ["addressLine1", "addressLine2", "city", "state", "zipCode"];

/**
 * Edit panel for the customer's address, used for both the agency business
 * address and the individual home address.
 *
 * Address fields are GUARDED: they save immediately for an approved account and
 * are rejected server-side while the account is under review. Only changed
 * fields are submitted, so an unrelated correction never drags the rest of the
 * address into the payload.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the drawer.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Customer profile supplying default values.
 * @param {string} props.title - Drawer heading, matching the card it opens from.
 * @param {() => void} [props.onSuccess] - Called after a successful save.
 */
export function AddressDrawer({ isOpen, onClose, profile, title, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateProfile = useUpdateCustomerProfile();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addressSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            addressLine1: profile?.addressLine1 || "",
            addressLine2: profile?.addressLine2 || "",
            city: profile?.city || "",
            state: profile?.state || "",
            zipCode: profile?.zipCode || "",
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
            title={title}
            description="Where we send therapists for visits."
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
                    <Button type="submit" form="address-form" loading={updateProfile.isPending}>
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form id="address-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    idPrefix="customer"
                    defaultAddressLine1={profile?.addressLine1 || ""}
                />
            </form>
        </Drawer>
    );
}
