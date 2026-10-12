"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Drawer, DRAWER_SIZES } from "@/components/ui/Drawer";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { useUpdateProfile } from "@/hooks/useTherapistProfile";
import { availabilityDetailsSchema } from "@/lib/validators/therapistProfileEdit.schema";
import { pickChangedFields } from "@/lib/validators/pickChangedFields";
import { toUtcDateOnlyISO } from "@/utils/dates";

const FIELDS = ["availableFrom", "caseloadCapacity"];

const isPastDate = (iso) => {
    if (!iso) return false;
    const today = new Date();
    const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    return new Date(iso).getTime() < utcToday;
};

export function AvailabilityDetailsDrawer({ isOpen, onClose, profile, onSuccess }) {
    const [alert, setAlert] = useState(null);
    const updateProfile = useUpdateProfile();

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(availabilityDetailsSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            availableFrom: profile?.availableFrom || null,
            caseloadCapacity: profile?.caseloadCapacity ?? "",
        },
    });

    const availableFrom = watch("availableFrom");

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
                message: err.response?.data?.message || "Failed to update availability details.",
            });
        }
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit availability details"
            description="When you start taking patients, and how many you can see."
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
                        form="availability-details-form"
                        loading={updateProfile.isPending}
                    >
                        Save Changes
                    </Button>
                </div>
            }
        >
            <form
                id="availability-details-form"
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

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="availability-available-from"
                        className="block text-sm font-bold uppercase tracking-wide text-text-main"
                    >
                        Available From
                    </label>
                    <Controller
                        name="availableFrom"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                id="availability-available-from"
                                selected={field.value ? new Date(field.value) : null}
                                onChange={(date) => field.onChange(toUtcDateOnlyISO(date))}
                                minDate={new Date()}
                                dateFormat="MMM d, yyyy"
                                placeholderText="Select start date"
                                isClearable
                                className="w-full rounded-xl border border-border-subtle bg-white px-4 py-3 text-text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        )}
                    />
                    {errors.availableFrom && (
                        <p className="text-sm text-red-500">{errors.availableFrom.message}</p>
                    )}
                    {isPastDate(availableFrom) ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs text-amber-600">
                                This date has passed — clear it if you are available now.
                            </p>
                            <button
                                type="button"
                                onClick={() => setValue("availableFrom", null, { shouldDirty: true })}
                                className="text-xs font-semibold text-primary underline"
                            >
                                Clear date
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-text-muted">
                            Leave blank if you are available immediately.
                        </p>
                    )}
                </div>

                <Input
                    label="Max Patients / Week"
                    type="number"
                    min={1}
                    max={999}
                    placeholder="e.g. 12"
                    error={errors.caseloadCapacity?.message}
                    helperText="Leave blank if you do not want to record a weekly limit."
                    {...register("caseloadCapacity")}
                />
            </form>
        </Drawer>
    );
}
