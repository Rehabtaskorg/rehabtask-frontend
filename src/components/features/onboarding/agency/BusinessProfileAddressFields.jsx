"use client";

import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { US_STATES } from "@/lib/constants/credentials";

/**
 * Right column of the Business Profile form — business address fields.
 * Address Line 1 uses Google Places autocomplete to auto-fill city, state, and ZIP.
 *
 * @param {{ register: Function, errors: Object, addressLine1Display: string, onAddressDisplayChange: Function, onAddressSelect: Function, onAddressClear: Function }} props
 */
export function BusinessProfileAddressFields({
    register,
    errors,
    addressLine1Display,
    onAddressDisplayChange,
    onAddressSelect,
    onAddressClear,
}) {
    return (
        <div className="space-y-6">
            <p className="text-text-main text-base font-semibold">Business Address</p>

            <LocationAutocomplete
                label="Address Line 1"
                required
                variant="form"
                restrictToAddress
                placeholder="e.g. 233 S Wacker Dr, Chicago, IL"
                value={addressLine1Display}
                onChange={onAddressDisplayChange}
                onSelect={onAddressSelect}
                onClear={onAddressClear}
                error={errors.addressLine1?.message}
                helperText="Select from the dropdown to auto-fill city, state, and ZIP"
            />

            <div className="flex flex-col gap-2">
                <label htmlFor="addressLine2" className="text-text-main text-base font-semibold">
                    Address Line 2{" "}
                    <span className="text-text-muted font-normal text-sm">(optional)</span>
                </label>
                <input
                    id="addressLine2"
                    type="text"
                    {...register("addressLine2")}
                    placeholder="e.g. Suite 400"
                    className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="city" className="text-text-main text-base font-semibold">
                    City <span className="text-red-500">*</span>
                </label>
                <input
                    id="city"
                    type="text"
                    {...register("city")}
                    placeholder="e.g. Chicago"
                    className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                        errors.city ? "border-red-500" : "border-border-light"
                    }`}
                />
                {errors.city && (
                    <p className="text-red-500 text-sm">{errors.city.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="state" className="text-text-main text-base font-semibold">
                        State <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="state"
                        {...register("state")}
                        className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none ${
                            errors.state ? "border-red-500" : "border-border-light"
                        }`}
                    >
                        <option value="">Select</option>
                        {US_STATES.map((s) => (
                            <option key={s.code} value={s.code}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    {errors.state && (
                        <p className="text-red-500 text-sm">{errors.state.message}</p>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="zipCode" className="text-text-main text-base font-semibold">
                        ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="zipCode"
                        type="text"
                        inputMode="numeric"
                        {...register("zipCode")}
                        placeholder="e.g. 60606"
                        maxLength={5}
                        className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                            errors.zipCode ? "border-red-500" : "border-border-light"
                        }`}
                    />
                    {errors.zipCode && (
                        <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
