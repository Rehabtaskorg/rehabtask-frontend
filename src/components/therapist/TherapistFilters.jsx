/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { MdLocationOn, MdDescription, MdClose, MdMedicalServices } from "react-icons/md";
import Input from "../ui/Input";
import { LICENSE_TYPES } from "@/lib/constants/credentials";
import { SPECIALIZATIONS } from "@/lib/constants/specializations";
import { geocodeZipCode } from "@/lib/geocoding";

export default function TherapistFilters({ filters, onFilterChange, onClear }) {
    const [localZip, setLocalZip] = useState(filters.zipCode || "");
    const [geocodeError, setGeocodeError] = useState("");

    // Sync external filter changes (e.g., "Clear All" resets zipCode)
    useEffect(() => {
        setLocalZip(filters.zipCode || "");
    }, [filters.zipCode]);

    const handleZipChange = async (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 5);
        setLocalZip(value);
        setGeocodeError("");

        // Clear location when ZIP is cleared or incomplete
        if (!value) {
            onFilterChange({
                ...filters,
                zipCode: "",
                latitude: undefined,
                longitude: undefined,
            });
            return;
        }

        if (value.length < 5) return;

        // Auto-geocode when 5 digits entered
        try {
            const result = await geocodeZipCode(value);
            if (result) {
                onFilterChange({
                    ...filters,
                    zipCode: value,
                    latitude: result.latitude,
                    longitude: result.longitude,
                });
            } else {
                setGeocodeError("Could not find this ZIP code. Please check and try again.");
            }
        } catch {
            setGeocodeError("Geocoding failed. Please try again.");
        }
    };

    const handleRadiusChange = (e) => {
        onFilterChange({
            ...filters,
            radiusMiles: parseInt(e.target.value, 10),
        });
    };

    const handleLicenseTypeToggle = (value) => {
        const current = filters.licenseTypes || [];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        onFilterChange({ ...filters, licenseTypes: updated });
    };

    const handleSpecializationToggle = (specValue) => {
        const current = filters.specializations || [];
        const updated = current.includes(specValue)
            ? current.filter((s) => s !== specValue)
            : [...current, specValue];
        onFilterChange({
            ...filters,
            specializations: updated,
        });
    };

    const hasActiveFilters =
        !!filters.zipCode ||
        (filters.licenseTypes && filters.licenseTypes.length > 0) ||
        (filters.specializations && filters.specializations.length > 0) ||
        filters.radiusMiles !== 25;

    return (
        <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 sticky top-20">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-base font-bold text-text-main dark:text-white">
                    Filters
                </h3>
                <p className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                    Refine your results
                </p>
            </div>

            {/* Location Section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <MdLocationOn className="text-primary text-base" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Location
                    </span>
                </div>
                <Input
                    label="ZIP CODE"
                    placeholder="e.g. 90210"
                    value={localZip}
                    onChange={handleZipChange}
                    error={geocodeError || undefined}
                />

                {/* Distance slider */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-text-muted dark:text-gray-400">
                            Distance (miles)
                        </label>
                        <span className="text-xs font-bold text-primary">
                            {filters.radiusMiles || 25} mi
                        </span>
                    </div>
                    <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={filters.radiusMiles || 25}
                        onChange={handleRadiusChange}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted dark:text-gray-500 mt-1">
                        <span>5 mi</span>
                        <span>100 mi</span>
                    </div>
                </div>
            </div>

            {/* Therapy Type Section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <MdMedicalServices className="text-primary text-base" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Therapy Type
                    </span>
                </div>
                <div className="space-y-3">
                    {LICENSE_TYPES.map((type) => {
                        const isChecked = (filters.licenseTypes || []).includes(type.value);
                        return (
                            <label
                                key={type.value}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleLicenseTypeToggle(type.value)}
                                    className="h-4 w-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary cursor-pointer"
                                />
                                <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors">
                                    {type.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Sub-Specialty Section */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <MdDescription className="text-primary text-base" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Sub-Specialty
                    </span>
                </div>
                <div className="space-y-3">
                    {SPECIALIZATIONS.map((spec) => {
                        const isChecked = (filters.specializations || []).includes(spec);
                        return (
                            <label
                                key={spec}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleSpecializationToggle(spec)}
                                    className="h-4 w-4 rounded border-border-light dark:border-border-dark text-primary focus:ring-primary cursor-pointer"
                                />
                                <span className="text-sm text-text-main dark:text-white group-hover:text-primary transition-colors">
                                    {spec}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Clear All */}
            {hasActiveFilters && (
                <button
                    onClick={onClear}
                    className="w-full py-2.5 px-4 rounded-lg border border-border-light dark:border-border-dark text-text-muted dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                    <MdClose className="text-base" />
                    Clear All Filters
                </button>
            )}
        </div>
    )

}