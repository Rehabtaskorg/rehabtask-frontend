"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";
import { ratesSchema } from "@/lib/validators/therapistProfileEdit.schema";

const toRateDefault = (value) => (value != null ? parseFloat(value) : "");

/**
 * Edit panel for all four rate fields. Every field here is OPEN tier, so saves
 * apply immediately with no re-review.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the drawer.
 * @param {() => void} props.onClose - Dismiss handler.
 * @param {Object} props.profile - Therapist profile supplying default values.
 * @param {() => void} [props.onSuccess] - Called after a successful save.
 */
export function RatesDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateProfile = useUpdateProfile();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ratesSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            ratePerVisit: toRateDefault(profile?.ratePerVisit),
            attemptedVisitRate: toRateDefault(profile?.attemptedVisitRate),
            evaluationRate: toRateDefault(profile?.evaluationRate),
            travelFee: toRateDefault(profile?.travelFee),
        },
    });

    const onSubmit = async (data) => {
        setAlert(null);
        try {
            await updateProfile.mutateAsync({
                ratePerVisit: data.ratePerVisit,
                attemptedVisitRate: data.attemptedVisitRate,
                evaluationRate: data.evaluationRate,
                travelFee: data.travelFee,
            });
            onSuccess?.();
            onClose();
        } catch (err) {
            setAlert({
                type: "error",
                message: err.response?.data?.message || "Failed to update your rates.",
            });
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit rates"
            description="Applies to new offers only."
            size={DRAWER_SIZES.MD}
            isDismissDisabled={updateProfile.isPending}
            footer={
                <div className="flex items-center justify-end gap-3">
                    <Button variant="secondary" onClick={onClose} disabled={updateProfile.isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" form="rates-form" loading={updateProfile.isPending}>
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form id="rates-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {alert && (
                    <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
                )}

                <Input
                    label="Rate per Visit ($)"
                    type="number"
                    min={0}
                    max={10000}
                    step="0.01"
                    placeholder="e.g. 85.00"
                    error={errors.ratePerVisit?.message}
                    {...register("ratePerVisit")}
                />

                <div className="space-y-1">
                    <Input
                        label="Attempted Visit Rate ($) — optional"
                        type="number"
                        min={0}
                        max={10000}
                        step="0.01"
                        placeholder="e.g. 40.00"
                        error={errors.attemptedVisitRate?.message}
                        {...register("attemptedVisitRate")}
                    />
                    <p className="text-xs text-text-muted">
                        Charged when you arrive but the patient isn&apos;t home. Must be less than or equal to your session rate. Leave blank if you won&apos;t charge for no-shows. Changes only apply to new offers — existing bookings keep their original rate.
                    </p>
                </div>

                <div className="space-y-1">
                    <Input
                        label="Evaluation Rate ($) — optional"
                        type="number"
                        min={0}
                        max={10000}
                        step="0.01"
                        placeholder="e.g. 120.00"
                        error={errors.evaluationRate?.message}
                        {...register("evaluationRate")}
                    />
                    <p className="text-xs text-text-muted">
                        Charged for an initial evaluation visit. Leave blank to use your standard session rate.
                    </p>
                </div>

                <div className="space-y-1">
                    <Input
                        label="Travel Fee ($) — optional"
                        type="number"
                        min={0}
                        max={10000}
                        step="0.01"
                        placeholder="e.g. 15.00"
                        error={errors.travelFee?.message}
                        {...register("travelFee")}
                    />
                    <p className="text-xs text-text-muted">
                        Added per visit to cover travel. Leave blank if you don&apos;t charge for travel.
                    </p>
                </div>
            </form>
        </Drawer>
    );
}
