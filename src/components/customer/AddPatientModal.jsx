"use client";

import { useState } from "react";
import { MdClose, MdPerson, MdCheck } from "react-icons/md";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useCreatePatient } from "@/hooks/usePatients";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";

const inputBase =
    "w-full bg-background-light  border border-border-light  rounded-lg px-4 py-2.5 text-sm text-text-main  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

/**
 * Modal for creating a new patient under an agency account.
 * Includes address autocomplete with map preview, and optional email/phone fields.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Function} [props.onSuccess] - Called after successful creation
 */
export default function AddPatientModal({ isOpen, onClose, onSuccess }) {
    const createPatient = useCreatePatient();

    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [certificationExpiry, setCertificationExpiry] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [addressText, setAddressText] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [errors, setErrors] = useState({});
    const [justAdded, setJustAdded] = useState(false);

    if (!isOpen) return null;

    const hasLocation = latitude !== null && longitude !== null;

    const resetForm = () => {
        setFullName("");
        setDateOfBirth("");
        setCertificationExpiry("");
        setEmail("");
        setPhone("");
        setAddressText("");
        setAddressLine1("");
        setCity("");
        setState("");
        setZipCode("");
        setLatitude(null);
        setLongitude(null);
        setErrors({});
        setJustAdded(false);
    };

    const handleAddressSelect = (result) => {
        setAddressText(result.formattedAddress);
        setAddressLine1(result.streetAddress || result.formattedAddress);
        setCity(result.city || "");
        setState(result.state || "");
        setZipCode(result.zipCode || "");
        setLatitude(result.latitude);
        setLongitude(result.longitude);
        setErrors((prev) => {
            const { address, city, state, zipCode, ...rest } = prev;
            return rest;
        });
    };

    const handleAddressChange = (text) => {
        setAddressText(text);
        if (latitude !== null) {
            setLatitude(null);
            setLongitude(null);
            setAddressLine1("");
            setCity("");
            setState("");
            setZipCode("");
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = "Full name is required";
        if (!dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        if (!certificationExpiry) newErrors.certificationExpiry = "Certification period is required";
        if (!addressLine1.trim()) newErrors.address = "Please select an address from the dropdown";
        if (!city.trim()) newErrors.city = "City is required";
        if (!state.trim()) newErrors.state = "State is required";
        if (!zipCode.trim()) newErrors.zipCode = "Zip code is required";
        else if (!/^\d{5}(-\d{4})?$/.test(zipCode.trim())) newErrors.zipCode = "Enter a valid US zip code (e.g. 90210)";
        if (email.trim() && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";
        if (phone.trim() && !/^\+1\d{10}$/.test(phone.trim())) {
            newErrors.phone = "Please enter a valid 10-digit US phone number";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await createPatient.mutateAsync({
                fullName: fullName.trim(),
                dateOfBirth,
                certificationExpiry,
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                addressLine1: addressLine1.trim(),
                city: city.trim(),
                state: state.trim(),
                zipCode: zipCode.trim(),
                latitude: latitude ?? undefined,
                longitude: longitude ?? undefined,
            });
            setJustAdded(true);
            onSuccess?.();
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                const fieldErrors = {};
                for (const e of data.errors) {
                    const field = e.field || e.path?.[0];
                    if (field) fieldErrors[field] = e.message;
                    else fieldErrors.form = e.message;
                }
                if (Object.keys(fieldErrors).length === 0) {
                    fieldErrors.form = data.message || "Validation failed. Please check your inputs.";
                }
                setErrors(fieldErrors);
            } else {
                setErrors({ form: data?.message || "Failed to add patient. Please try again." });
            }
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !createPatient.isPending) {
            resetForm();
            onClose();
        }
    };

    const handleClose = () => {
        if (createPatient.isPending) return;
        resetForm();
        onClose();
    };

    const fieldClass = (hasError) =>
        `${inputBase} ${hasError ? "border-red-400  focus:ring-red-400/40" : ""}`;

    // Success state
    if (justAdded) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
                <div className="bg-card-light  rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-100  flex items-center justify-center mx-auto">
                            <MdCheck className="text-emerald-600  text-3xl" />
                        </div>
                        <h2 className="text-lg font-bold text-text-main ">Patient Added</h2>
                        <p className="text-sm text-text-muted ">The patient has been added to your roster.</p>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={resetForm}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                            >
                                Add Another
                            </button>
                            <button
                                onClick={handleClose}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <div className="bg-card-light  rounded-xl w-full max-w-140 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border-light  flex items-center justify-between shrink-0">
                        <h2 className="text-lg font-bold text-text-main ">Add New Patient</h2>
                        <button
                            onClick={handleClose}
                            disabled={createPatient.isPending}
                            className="text-text-muted  hover:text-text-main  transition-colors p-1 disabled:opacity-50"
                        >
                            <MdClose className="text-xl" />
                        </button>
                    </div>

                    {/* Scrollable Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
                        {errors.form && (
                            <div className="bg-red-50  border border-red-200  text-red-700  px-4 py-3 rounded-lg text-sm">
                                {errors.form}
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-text-main  mb-1.5">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted  text-lg" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter patient full name"
                                    className={`${fieldClass(errors.fullName)} pl-10`}
                                />
                            </div>
                            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                        </div>

                        {/* Date of Birth + Certification Period */}
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-text-main  mb-1.5">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => {
                                        setDateOfBirth(e.target.value);
                                        if (e.target.value) setErrors((prev) => { const { dateOfBirth: _, ...rest } = prev; return rest; });
                                    }}
                                    max={new Date().toISOString().split("T")[0]}
                                    className={fieldClass(errors.dateOfBirth)}
                                />
                                {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-text-main  mb-1.5">
                                    Certification Period <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={certificationExpiry}
                                    onChange={(e) => {
                                        setCertificationExpiry(e.target.value);
                                        if (e.target.value) setErrors((prev) => { const { certificationExpiry: _, ...rest } = prev; return rest; });
                                    }}
                                    className={fieldClass(errors.certificationExpiry)}
                                />
                                {errors.certificationExpiry && <p className="text-xs text-red-500 mt-1">{errors.certificationExpiry}</p>}
                            </div>
                        </div>

                        {/* Address Autocomplete */}
                        <div>
                            <LocationAutocomplete
                                variant="form"
                                value={addressText}
                                onChange={handleAddressChange}
                                onSelect={handleAddressSelect}
                                onClear={() => handleAddressChange("")}
                                label="Address"
                                placeholder="e.g. Miami, FL or 123 Main St, Houston, TX"
                                required
                                error={errors.address}
                                helperText={hasLocation ? null : "Enter a city or full address"}
                            />
                        </div>

                        {/* City / State / Zip */}
                        {hasLocation && (
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold text-text-muted  uppercase tracking-wider mb-1">City</label>
                                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass(errors.city)} />
                                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-semibold text-text-muted  uppercase tracking-wider mb-1">State</label>
                                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={`${fieldClass(errors.state)} text-center`} />
                                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-semibold text-text-muted  uppercase tracking-wider mb-1">Zip</label>
                                    <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className={`${fieldClass(errors.zipCode)} text-center`} />
                                    {errors.zipCode && <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>}
                                </div>
                            </div>
                        )}

                        {/* Map Preview */}
                        {hasLocation && (
                            <div className="rounded-xl overflow-hidden border border-border-light  h-40">
                                <Map
                                    center={{ lat: latitude, lng: longitude }}
                                    zoom={14}
                                    mapId="patient-address-map"
                                    disableDefaultUI
                                    className="w-full h-full"
                                >
                                    <AdvancedMarker position={{ lat: latitude, lng: longitude }} />
                                </Map>
                            </div>
                        )}

                        {/* Email (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-text-main  mb-1.5">
                                Email <span className="text-text-muted  font-normal text-xs">(Optional)</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="patient@example.com"
                                className={fieldClass(errors.email)}
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Phone (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-text-main  mb-1.5">
                                Phone <span className="text-text-muted  font-normal text-xs">(Optional)</span>
                            </label>
                            <div className={`flex items-center rounded-lg border overflow-hidden ${errors.phone ? "border-red-400 " : "border-border-light "} bg-background-light `}>
                                <span className="px-3 py-2.5 text-sm text-text-muted  border-r border-border-light  select-none bg-slate-50  shrink-0">
                                    +1
                                </span>
                                <input
                                    type="tel"
                                    value={phone.startsWith("+1") ? phone.slice(2) : phone}
                                    onChange={(e) => {
                                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setPhone(digits ? `+1${digits}` : "");
                                    }}
                                    maxLength={10}
                                    placeholder="2025550123"
                                    className="flex-1 px-3 py-2.5 bg-transparent text-text-main  text-sm focus:outline-none placeholder:text-text-muted/50"
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                        </div>

                        {/* Footer */}
                        <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={createPatient.isPending}
                                className="px-4 py-2.5 text-sm font-medium text-text-muted  hover:text-text-main  hover:bg-slate-50  rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createPatient.isPending}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {createPatient.isPending ? "Adding..." : "Add Patient"}
                            </button>
                        </div>
                    </form>
                </div>
            </APIProvider>
        </div>
    );
}