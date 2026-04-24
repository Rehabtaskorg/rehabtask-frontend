const EARTH_RADIUS_METERS = 6378137;
const OFFSET_RADIUS_METERS = 60;
const COORDINATE_PRECISION = 4;

function offsetCoordinate(lat, lng, angleRadians, distanceMeters) {
    const latRadians = (lat * Math.PI) / 180;
    const deltaLat = (distanceMeters * Math.cos(angleRadians)) / EARTH_RADIUS_METERS;
    const deltaLng = (distanceMeters * Math.sin(angleRadians)) / (EARTH_RADIUS_METERS * Math.cos(latRadians));
    return {
        lat: lat + (deltaLat * 180) / Math.PI,
        lng: lng + (deltaLng * 180) / Math.PI,
    };
}

function coordinateKey(lat, lng) {
    return `${lat.toFixed(COORDINATE_PRECISION)},${lng.toFixed(COORDINATE_PRECISION)}`;
}

export function distributePinsOnOverlap(pins) {
    const buckets = new Map();
    for (const pin of pins) {
        const key = coordinateKey(pin.latitude, pin.longitude);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(pin);
    }

    const distributed = [];
    for (const bucket of buckets.values()) {
        if (bucket.length === 1) {
            const [pin] = bucket;
            distributed.push({
                ...pin,
                originalLatitude: pin.latitude,
                originalLongitude: pin.longitude,
            });
            continue;
        }

        const ordered = [...bucket].sort((a, b) => a.id.localeCompare(b.id));
        const centerLat = ordered[0].latitude;
        const centerLng = ordered[0].longitude;
        const angleStep = (2 * Math.PI) / ordered.length;

        ordered.forEach((pin, index) => {
            const { lat, lng } = offsetCoordinate(
                centerLat,
                centerLng,
                index * angleStep,
                OFFSET_RADIUS_METERS,
            );
            distributed.push({
                ...pin,
                latitude: lat,
                longitude: lng,
                originalLatitude: pin.latitude,
                originalLongitude: pin.longitude,
            });
        });
    }

    return distributed;
}
