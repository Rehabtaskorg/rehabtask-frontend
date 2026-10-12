"use client";

import { useState } from "react";

export function useAddressAutocomplete({ setValue, defaultAddressLine1 = "", isCoordinatesTracked = false }) {
    const [addressLine1Display, setAddressLine1Display] = useState(defaultAddressLine1);

    const applyAddress = ({ formattedAddress, city, state, zipCode, latitude, longitude }) => {
        setAddressLine1Display(formattedAddress);
        setValue("addressLine1", formattedAddress, { shouldValidate: false });
        setValue("city", city, { shouldValidate: false });
        setValue("state", state, { shouldValidate: false });
        setValue("zipCode", zipCode, { shouldValidate: false });

        if (isCoordinatesTracked) {
            setValue("latitude", latitude, { shouldValidate: false });
            setValue("longitude", longitude, { shouldValidate: false });
        }
    };

    const handleAddressSelect = (place) => applyAddress(place);

    const handleAddressClear = () =>
        applyAddress({
            formattedAddress: "",
            city: "",
            state: "",
            zipCode: "",
            latitude: null,
            longitude: null,
        });

    return {
        addressLine1Display,
        setAddressLine1Display,
        handleAddressSelect,
        handleAddressClear,
    };
}
