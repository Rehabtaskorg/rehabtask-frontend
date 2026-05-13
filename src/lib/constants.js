export const RADIUS_PRESETS = [
    { label: "My city",   miles: 15 },
    { label: "My area",   miles: 30 },
    { label: "My region", miles: 60 },
];

export const DEFAULT_RADIUS_PRESET = RADIUS_PRESETS[1]; // 30 miles

export const getPresetLabel = (miles) =>
    RADIUS_PRESETS.reduce((prev, curr) =>
        Math.abs(curr.miles - miles) < Math.abs(prev.miles - miles) ? curr : prev
    ).label;

export const PUBLIC_SEARCH_RADIUS_MILES = 50;