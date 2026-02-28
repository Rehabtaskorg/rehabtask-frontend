/**
 * Geocode a US ZIP code using Google Maps Geocoding REST API.
 * Returns { city, state, latitude, longitude } or null on failure.
 */
export const geocodeZipCode = async (zipCode) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(zipCode)}&components=country:US&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "OK" && data.results[0]) {
        const result = data.results[0];
        const location = result.geometry.location;
        const addressComponents = result.address_components;

        const cityComponent = addressComponents.find(
            (c) => c.types.includes("locality") || c.types.includes("sublocality_level_1")
        );
        const stateComponent = addressComponents.find(
            (c) => c.types.includes("administrative_area_level_1")
        );

        const city = cityComponent?.long_name;
        const state = stateComponent?.short_name;

        if (!city || !state) return null;

        return { city, state, latitude: location.lat, longitude: location.lng };
    }

    return null;
};