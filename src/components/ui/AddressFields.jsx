"use client";

import Input from "@/components/ui/Input";
import { US_STATES } from "@/lib/constants/credentials";

export function AddressFields({ register, errors, idPrefix }) {
    const stateFieldId = `${idPrefix}-address-state`;

    return (
        <>
            <Input
                label="Address Line 1"
                placeholder="e.g. 233 S Wacker Dr"
                error={errors.addressLine1?.message}
                required
                {...register("addressLine1")}
            />

            <Input
                label="Address Line 2 — optional"
                placeholder="e.g. Suite 400"
                error={errors.addressLine2?.message}
                {...register("addressLine2")}
            />

            <Input
                label="City"
                placeholder="e.g. Chicago"
                error={errors.city?.message}
                required
                {...register("city")}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <label
                        htmlFor={stateFieldId}
                        className="block text-sm font-bold uppercase tracking-wide text-text-main"
                    >
                        State<span className="ml-1 text-red-500">*</span>
                    </label>
                    <select
                        id={stateFieldId}
                        {...register("state")}
                        className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 text-text-main outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 ${errors.state ? "border-red-500" : "border-border-subtle"}`}
                    >
                        <option value="">Select</option>
                        {US_STATES.map((s) => (
                            <option key={s.code} value={s.code}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    {errors.state && (
                        <p className="text-sm text-red-500">{errors.state.message}</p>
                    )}
                </div>

                <Input
                    label="ZIP Code"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="e.g. 60606"
                    error={errors.zipCode?.message}
                    required
                    {...register("zipCode")}
                />
            </div>
        </>
    );
}
