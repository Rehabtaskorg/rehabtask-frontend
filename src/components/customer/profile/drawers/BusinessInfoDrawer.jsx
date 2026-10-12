"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useUpdateCustomerProfile } from "@/hooks/useCustomerProfile";
import { businessInfoSchema, pickChangedFields } from "@/lib/validators/customerProfileEdit.schema";
import { BusinessInfoFields } from "./BusinessInfoFields";

const FIELDS = ["agencyName", "ein", "dbaName", "billingEmail"];
const HARD_REVIEW_FIELDS = ["agencyName", "ein"];

const HARD_REVIEW_MESSAGE =
    "Your agency's legal name and EIN are what we verified when we approved you, so changing either sends your account back to review. Until a reviewer approves it you won't be able to book therapists, post new requests, or start new conversations. Visits already booked carry on as normal.";

/**
 * Edit panel for agency business details.
 *
 * The four fields here span three policy tiers, so only the fields that
 * actually changed are submitted — the backend flags an account for re-review
 * whenever a VERIFIED-tier field is present in the payload at all, which would
 * otherwise send an agency to `review` over a billing-email typo fix. A change
 * to `agencyName` or `ein` is VERIFIED_HARD and confirmed explicitly before it
 * is sent.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the drawer.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Customer profile supplying default values.
 * @param {() => void} [props.onSuccess] - Called after a successful save.
 */
export function BusinessInfoDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const [pendingPayload, setPendingPayload] = useState(null);
    const updateProfile = useUpdateCustomerProfile();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(businessInfoSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            agencyName: profile?.agencyName || "",
            ein: profile?.ein || "",
            dbaName: profile?.dbaName || "",
            billingEmail: profile?.billingEmail || "",
        },
    });

    const save = async (payload) => {
        setAlert(null);
        try {
            await updateProfile.mutateAsync(payload);
            onSuccess?.();
            onClose();
        } catch (err) {
            setAlert({ type: "error", message: err.message });
        }
    };

    const onSubmit = async (data) => {
        setAlert(null);
        const payload = pickChangedFields(data, profile, FIELDS);

        if (Object.keys(payload).length === 0) {
            onClose();
            return;
        }

        if (HARD_REVIEW_FIELDS.some((field) => field in payload)) {
            setPendingPayload(payload);
            return;
        }

        await save(payload);
    };

    const handleConfirmHardReview = async () => {
        const payload = pendingPayload;
        setPendingPayload(null);
        if (payload) await save(payload);
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit business information"
            description="Your agency's registered details and billing contact."
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
                        form="business-info-form"
                        loading={updateProfile.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form id="business-info-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {alert && (
                    <Alert
                        type={alert.type}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                <BusinessInfoFields register={register} errors={errors} />
            </form>

            <ConfirmModal
                isOpen={pendingPayload !== null}
                onClose={() => setPendingPayload(null)}
                onConfirm={handleConfirmHardReview}
                title="This sends your account back to review"
                message={HARD_REVIEW_MESSAGE}
                confirmLabel="Save and send for review"
                cancelLabel="Keep editing"
                confirmClassName="bg-amber-600 hover:bg-amber-700 text-white"
                loading={updateProfile.isPending}
            />
        </Drawer>
    );
}
