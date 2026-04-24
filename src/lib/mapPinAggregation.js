const COORDINATE_PRECISION = 4;

function coordinateKey(lat, lng) {
    return `${lat.toFixed(COORDINATE_PRECISION)},${lng.toFixed(COORDINATE_PRECISION)}`;
}

function buildAggregateLabel(therapists) {
    const rates = therapists
        .map((t) => t.rate)
        .filter((r) => typeof r === "number" && r > 0);
    const count = therapists.length;

    if (rates.length === 0) {
        return { primary: `${count}`, suffix: count === 1 ? "therapist" : "therapists" };
    }

    const min = Math.min(...rates);
    const max = Math.max(...rates);

    if (count === 1) {
        return { primary: `$${min}`, suffix: null };
    }

    if (min === max) {
        return { primary: `$${min}`, suffix: `· ${count}` };
    }

    return { primary: `$${min}–$${max}`, suffix: `· ${count}` };
}

export function aggregatePinsByLocation(pins) {
    const buckets = new Map();

    for (const pin of pins) {
        const key = coordinateKey(pin.latitude, pin.longitude);
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(pin);
    }

    const aggregated = [];
    for (const bucket of buckets.values()) {
        const first = bucket[0];
        aggregated.push({
            id: coordinateKey(first.latitude, first.longitude),
            latitude: first.latitude,
            longitude: first.longitude,
            location: first.location,
            therapists: bucket.map((p) => ({
                id: p.therapistId,
                pinId: p.id,
                fullName: p.fullName,
                rate: p.rate,
                photoUrl: p.photoUrl,
                rating: p.rating,
                reviewCount: p.reviewCount,
            })),
            label: buildAggregateLabel(bucket),
        });
    }

    return aggregated;
}
