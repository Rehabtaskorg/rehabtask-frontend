"use client";

import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Input from "@/components/ui/Input";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { US_STATES } from "@/lib/constants/credentials";

const toStreetAddress = (formattedAddress, city) => {
    if (!formattedAddress) return "";
    const [street] = formattedAddress.split(",");
    const trimmed = street.trim();
    return trimmed && trimmed !== city ? trimmed : formattedAddress;
};

export function AddressFields({ register, errors, setValue, idPrefix, defaultAddressLine1 = "" }) {
    const stateFieldId = `${idPrefix}-address-state`;
    const [addressLine1Display, setAddressLine1Display] = useState(defaultAddressLine1);
    const [incompleteAddress, setIncompleteAddress] = useState(null);

    const handleAddressSelect = ({ formattedAddress, city, state, zipCode, streetNumber }) => {
        const street = toStreetAddress(formattedAddress, city);

        if (!streetNumber) {
            setIncompleteAddress(street);
            return;
        }

        setIncompleteAddress(null);
        setAddressLine1Display(street);
        setValue("addressLine1", street, { shouldValidate: false, shouldDirty: true });
        setValue("city", city, { shouldValidate: false, shouldDirty: true });
        setValue("state", state, { shouldValidate: false, shouldDirty: true });
        setValue("zipCode", zipCode, { shouldValidate: false, shouldDirty: true });
    };

    const handleAddressChange = (next) => {
        setIncompleteAddress(null);
        setAddressLine1Display(next);
        setValue("addressLine1", "", { shouldValidate: false, shouldDirty: true });
    };

    const handleAddressClear = () => {
        setIncompleteAddress(null);
        setAddressLine1Display("");
        setValue("addressLine1", "", { shouldValidate: false, shouldDirty: true });
        setValue("city", "", { shouldValidate: false, shouldDirty: true });
        setValue("state", "", { shouldValidate: false, shouldDirty: true });
        setValue("zipCode", "", { shouldValidate: false, shouldDirty: true });
    };

    return (
        <>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <LocationAutocomplete
                    label="Address Line 1"
                    required
                    variant="form"
                    restrictToAddress
                    placeholder="e.g. 233 S Wacker Dr"
                    value={addressLine1Display}
                    onChange={handleAddressChange}
                    onSelect={handleAddressSelect}
                    onClear={handleAddressClear}
                    error={
                        incompleteAddress
                            ? `"${incompleteAddress}" has no house number. Pick a result that starts with one, or type the full address and select it.`
                            : errors.addressLine1?.message
                    }
                    helperText="Select from the dropdown to auto-fill city, state and ZIP"
                />
            </APIProvider>

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
