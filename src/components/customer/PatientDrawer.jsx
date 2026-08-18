"use client";

import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import {
    MdClose, MdEdit, MdEmail, MdPhone,
    MdLocationOn, MdCheck, MdAssignment, MdCake, MdVerified,
} from "react-icons/md";
import { usePatient, useUpdatePatient } from "@/hooks/usePatients";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { formatShortDate } from "@/utils/dates";
import { BOOKING_STATUS } from "@/lib/constants";
import { validateCertificationPeriod } from "@/lib/validators/therapist.schema";

const REQUEST_STATUS_CONFIG = {
    created:         { label: "Created",         color: "text-blue-500 bg-blue-50 " },
    offers_received: { label: "Offers Received",  color: "text-amber-500 bg-amber-50 " },
    offers_accepted: { label: "Accepted",         color: "text-emerald-500 bg-emerald-50 " },
    completed:       { label: "Completed",        color: "text-slate-500 bg-slate-50 " },
    cancelled:       { label: "Cancelled",        color: "text-red-500 bg-red-50 " },
};

const ACTIVE_BOOKING_STATUSES = new Set([
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.ACCEPTED,
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.IN_PROGRESS,
    BOOKING_STATUS.RESCHEDULE_REQUESTED,
]);

const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const inputClass = "w-full px-3 py-2 rounded-lg border border-border-light  bg-background-light  text-text-main  text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

// TODO: [NEXT] This component exceeds the 150-line limit and uses a manual
// useState form instead of React Hook Form + Zod, both required by CLAUDE.md.
// Also reads process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY directly instead of
// via src/lib/config.js. Pre-existing issues — needs a dedicated refactor.
/**
 * Slide-over drawer showing patient detail, contact info, and activity history.
 * Supports inline editing of patient information.
 *
 * @param {Object} props
 * @param {string} props.patientId
 * @param {Function} props.onClose
 */
export default function PatientDrawer({ patientId, onClose }) {
    const { data: patient, isLoading } = usePatient(patientId);
    const updatePatient = useUpdatePatient();

    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [addressText, setAddressText] = useState("");

    const handleStartEdit = () => {
        if (!patient) return;
        setEditData({
            fullName:            patient.fullName || "",
            dateOfBirth:         patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "",
            gender:              patient.gender || "",
            certificationStart:  patient.certificationStart ? patient.certificationStart.split("T")[0] : "",
            certificationEnd:    patient.certificationEnd ? patient.certificationEnd.split("T")[0] : "",
            email:               patient.email || "",
            phone:               patient.phone || "",
            addressLine1:        patient.addressLine1 || "",
            city:                patient.city || "",
            state:               patient.state || "",
            zipCode:             patient.zipCode || "",
            latitude:            patient.latitude != null ? parseFloat(patient.latitude) : null,
            longitude:           patient.longitude != null ? parseFloat(patient.longitude) : null,
        });
        setAddressText(
            patient.addressLine1
                ? [patient.addressLine1, patient.city, patient.state, patient.zipCode].filter(Boolean).join(", ")
                : ""
        );
        setEditErrors({});
        setEditing(true);
    };

    const handleEditAddressSelect = (result) => {
        setAddressText(result.formattedAddress);
        setEditData((d) => ({
            ...d,
            addressLine1: result.streetAddress || result.formattedAddress,
            city:         result.city || "",
            state:        result.state || "",
            zipCode:      result.zipCode || "",
            latitude:     result.latitude,
            longitude:    result.longitude,
        }));
        setEditErrors((prev) => {
            const { addressLine1, city, state, zipCode, ...rest } = prev;
            return rest;
        });
    };

    const handleEditAddressChange = (text) => {
        setAddressText(text);
        if (editData.latitude != null) {
            setEditData((d) => ({
                ...d,
                addressLine1: "",
                city:         "",
                state:        "",
                zipCode:      "",
                latitude:     null,
                longitude:    null,
            }));
        }
    };

    const validateEdit = () => {
        const errs = {};
        if (!editData.fullName?.trim()) errs.fullName = "Name is required";
        if (!editData.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
        Object.assign(errs, validateCertificationPeriod(editData.certificationStart, editData.certificationEnd));
        if (editData.email?.trim() && !/\S+@\S+\.\S+/.test(editData.email.trim()))
            errs.email = "Please enter a valid email";
        if (editData.phone?.trim() && !/^\+1\d{10}$/.test(editData.phone.trim()))
            errs.phone = "Please enter a valid 10-digit US phone number";
        if (editData.zipCode?.trim() && !/^\d{5}(-\d{4})?$/.test(editData.zipCode.trim()))
            errs.zipCode = "Enter a valid US zip code (e.g. 90210)";
        setEditErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSaveEdit = async () => {
        if (!validateEdit()) return;
        setEditErrors({});
        try {
            await updatePatient.mutateAsync({
                id: patientId,
                data: {
                    fullName:            editData.fullName.trim(),
                    dateOfBirth:         editData.dateOfBirth || undefined,
                    gender:              editData.gender || undefined,
                    certificationStart:  editData.certificationStart || undefined,
                    certificationEnd:    editData.certificationEnd || undefined,
                    email:               editData.email?.trim() || "",
                    phone:        editData.phone?.trim() || "",
                    addressLine1: editData.addressLine1?.trim() || "",
                    city:         editData.city?.trim() || "",
                    state:        editData.state?.trim() || "",
                    zipCode:      editData.zipCode?.trim() || "",
                    latitude:     editData.latitude ?? null,
                    longitude:    editData.longitude ?? null,
                },
            });
            setEditing(false);
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
                setEditErrors(fieldErrors);
            } else {
                setEditErrors({ form: data?.message || "Failed to update patient." });
            }
        }
    };

    const totalRequests  = patient?.requestsForPatient?.length || 0;
    const activeBookings = patient?.bookingsForPatient?.filter((b) => ACTIVE_BOOKING_STATUSES.has(b.status)).length || 0;
    const lastBooking    = patient?.bookingsForPatient?.[0];

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

            <aside className="fixed right-0 top-0 h-full w-full max-w-120 bg-card-light  shadow-2xl z-50 flex flex-col border-l border-border-light  transition-transform duration-300 ease-out">
                {/* Header */}
                <div className="p-6 border-b border-border-light  shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <button
                            onClick={onClose}
                            className="p-1.5 text-text-muted  hover:text-text-main  rounded-lg hover:bg-muted-light  transition-colors"
                        >
                            <MdClose className="text-xl" />
                        </button>
                        {!editing && patient && (
                            <button
                                onClick={handleStartEdit}
                                className="flex items-center gap-1.5 text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                            >
                                <MdEdit className="text-sm" /> Edit
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex items-center gap-4 animate-pulse">
                            <div className="w-16 h-16 rounded-2xl bg-slate-200 " />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 bg-slate-200  rounded w-40" />
                                <div className="h-3 bg-slate-200  rounded w-24" />
                            </div>
                        </div>
                    ) : patient ? (
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                                {getInitials(patient.fullName)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main ">{patient.fullName}</h2>
                                {(patient.city || patient.state) && (
                                    <p className="text-sm text-text-muted ">
                                        {[patient.city, patient.state].filter(Boolean).join(", ")}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 panel-scroll">
                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-200  rounded-xl" />)}
                            </div>
                            <div className="h-32 bg-slate-200  rounded-xl" />
                        </div>
                    ) : patient ? (
                        <>
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-muted-light  p-4 rounded-xl border border-border-light  text-center">
                                    <p className="text-2xl font-black text-primary">{totalRequests}</p>
                                    <p className="text-[10px] font-bold text-text-muted  uppercase mt-1">Requests</p>
                                </div>
                                <div className="bg-muted-light  p-4 rounded-xl border border-border-light  text-center">
                                    <p className="text-2xl font-black text-primary">{activeBookings}</p>
                                    <p className="text-[10px] font-bold text-text-muted  uppercase mt-1">Active Bookings</p>
                                </div>
                                <div className="bg-muted-light  p-4 rounded-xl border border-border-light  text-center">
                                    <p className="text-lg font-black text-primary">{lastBooking ? formatShortDate(lastBooking.scheduledDate) : "—"}</p>
                                    <p className="text-[10px] font-bold text-text-muted  uppercase mt-1">Last Visit</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <section>
                                <h3 className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-3">
                                    Contact Information
                                </h3>

                                {editing ? (
                                    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                                        <div className="space-y-3">
                                            {editErrors.form && (
                                                <div className="bg-red-50  border border-red-200  text-red-700  px-3 py-2 rounded-lg text-sm">
                                                    {editErrors.form}
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs font-semibold text-text-muted  mb-1">Full Name</label>
                                                <input type="text" value={editData.fullName} onChange={(e) => setEditData((d) => ({ ...d, fullName: e.target.value }))} className={inputClass} />
                                                {editErrors.fullName && <p className="text-xs text-red-500 mt-1">{editErrors.fullName}</p>}
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-semibold text-text-muted  mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="date"
                                                        value={editData.dateOfBirth || ""}
                                                        onChange={(e) => {
                                                            setEditData((d) => ({ ...d, dateOfBirth: e.target.value }));
                                                            if (e.target.value) setEditErrors((prev) => { const { dateOfBirth: _, ...rest } = prev; return rest; });
                                                        }}
                                                        max={new Date().toISOString().split("T")[0]}
                                                        className={inputClass}
                                                    />
                                                    {editErrors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{editErrors.dateOfBirth}</p>}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-semibold text-text-muted  mb-1">Gender</label>
                                                    <select
                                                        value={editData.gender || ""}
                                                        onChange={(e) => setEditData((d) => ({ ...d, gender: e.target.value }))}
                                                        className={inputClass}
                                                    >
                                                        <option value="">Select gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-semibold text-text-muted  mb-1">Certification Period — Start <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="date"
                                                        value={editData.certificationStart || ""}
                                                        onChange={(e) => {
                                                            setEditData((d) => ({ ...d, certificationStart: e.target.value }));
                                                            if (e.target.value) setEditErrors((prev) => { const { certificationStart: _, ...rest } = prev; return rest; });
                                                        }}
                                                        className={inputClass}
                                                    />
                                                    {editErrors.certificationStart && <p className="text-xs text-red-500 mt-1">{editErrors.certificationStart}</p>}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-semibold text-text-muted  mb-1">Certification Period — End <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="date"
                                                        value={editData.certificationEnd || ""}
                                                        onChange={(e) => {
                                                            setEditData((d) => ({ ...d, certificationEnd: e.target.value }));
                                                            if (e.target.value) setEditErrors((prev) => { const { certificationEnd: _, ...rest } = prev; return rest; });
                                                        }}
                                                        className={inputClass}
                                                    />
                                                    {editErrors.certificationEnd && <p className="text-xs text-red-500 mt-1">{editErrors.certificationEnd}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <LocationAutocomplete
                                                    variant="form"
                                                    value={addressText}
                                                    onChange={handleEditAddressChange}
                                                    onSelect={handleEditAddressSelect}
                                                    onClear={() => handleEditAddressChange("")}
                                                    label="Address"
                                                    placeholder="e.g. Miami, FL or 123 Main St, Houston, TX"
                                                    error={editErrors.addressLine1}
                                                />
                                            </div>
                                            {editData.latitude != null && (
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-semibold text-text-muted  mb-1">City</label>
                                                        <input type="text" value={editData.city} onChange={(e) => setEditData((d) => ({ ...d, city: e.target.value }))} className={inputClass} />
                                                        {editErrors.city && <p className="text-xs text-red-500 mt-1">{editErrors.city}</p>}
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="block text-xs font-semibold text-text-muted  mb-1">State</label>
                                                        <input type="text" value={editData.state} onChange={(e) => setEditData((d) => ({ ...d, state: e.target.value }))} className={inputClass} />
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="block text-xs font-semibold text-text-muted  mb-1">Zip</label>
                                                        <input type="text" value={editData.zipCode} onChange={(e) => setEditData((d) => ({ ...d, zipCode: e.target.value }))} className={inputClass} />
                                                        {editErrors.zipCode && <p className="text-xs text-red-500 mt-1">{editErrors.zipCode}</p>}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs font-semibold text-text-muted  mb-1">
                                                    Email <span className="text-text-muted/50 font-normal">(Optional)</span>
                                                </label>
                                                <input type="email" value={editData.email} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))} className={inputClass} />
                                                {editErrors.email && <p className="text-xs text-red-500 mt-1">{editErrors.email}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-text-muted  mb-1">
                                                    Phone <span className="text-text-muted/50 font-normal">(Optional)</span>
                                                </label>
                                                <div className={`flex items-center rounded-lg border overflow-hidden ${editErrors.phone ? "border-red-400 " : "border-border-light "} bg-background-light `}>
                                                    <span className="px-3 py-2 text-sm text-text-muted  border-r border-border-light  select-none bg-slate-50  shrink-0">
                                                        +1
                                                    </span>
                                                    <input
                                                        type="tel"
                                                        value={(editData.phone || "").startsWith("+1") ? editData.phone.slice(2) : (editData.phone || "")}
                                                        onChange={(e) => {
                                                            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                                            setEditData((d) => ({ ...d, phone: digits ? `+1${digits}` : "" }));
                                                        }}
                                                        maxLength={10}
                                                        placeholder="2025550123"
                                                        className="flex-1 px-3 py-2 bg-transparent text-text-main  text-sm focus:outline-none placeholder:text-text-muted/50"
                                                    />
                                                </div>
                                                {editErrors.phone && <p className="text-xs text-red-500 mt-1">{editErrors.phone}</p>}
                                            </div>
                                            <div className="flex items-center gap-2 pt-2">
                                                <button
                                                    onClick={handleSaveEdit}
                                                    disabled={updatePatient.isPending}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <MdCheck className="text-base" />
                                                    {updatePatient.isPending ? "Saving..." : "Save"}
                                                </button>
                                                <button
                                                    onClick={() => { setEditing(false); setEditErrors({}); }}
                                                    className="px-4 py-2 text-text-muted  hover:text-text-main  text-sm font-bold transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </APIProvider>
                                ) : (
                                    <div className="bg-muted-light  rounded-xl p-4 space-y-4 border border-border-light ">
                                        {patient.addressLine1 && (
                                            <div className="flex items-start gap-3">
                                                <MdLocationOn className="text-primary text-lg shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-text-main ">{patient.addressLine1}</p>
                                                    <p className="text-xs text-text-muted ">
                                                        {[patient.city, patient.state, patient.zipCode].filter(Boolean).join(", ")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <MdCake className="text-primary text-lg shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-text-muted  uppercase font-bold">Date of Birth</p>
                                                <p className="text-sm text-text-main ">
                                                    {patient.dateOfBirth ? formatShortDate(patient.dateOfBirth) : "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MdVerified className="text-primary text-lg shrink-0" />
                                            <div>
                                                <p className="text-[10px] text-text-muted  uppercase font-bold">Certification Period</p>
                                                <p className="text-sm text-text-main ">
                                                    {patient.certificationStart && patient.certificationEnd
                                                        ? `${formatShortDate(patient.certificationStart)} – ${formatShortDate(patient.certificationEnd)}`
                                                        : "—"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MdEmail className="text-primary text-lg shrink-0" />
                                            <p className="text-sm text-text-main ">{patient.email || "—"}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MdPhone className="text-primary text-lg shrink-0" />
                                            <p className="text-sm text-text-main ">{patient.phone || "—"}</p>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Recent Requests */}
                            <section>
                                <h3 className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-3">
                                    Recent Requests
                                </h3>
                                {patient.requestsForPatient?.length > 0 ? (
                                    <div className="space-y-2">
                                        {patient.requestsForPatient.slice(0, 5).map((req) => {
                                            const config = REQUEST_STATUS_CONFIG[req.status] || REQUEST_STATUS_CONFIG.created;
                                            return (
                                                <div
                                                    key={req.id}
                                                    className="flex items-center justify-between p-3 bg-muted-light  rounded-lg border border-border-light "
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-text-main ">{req.serviceType}</p>
                                                        <p className="text-[11px] text-text-muted ">{formatShortDate(req.createdAt)}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-muted-light  rounded-xl border border-border-light ">
                                        <MdAssignment className="text-3xl text-slate-200  mx-auto mb-1" />
                                        <p className="text-xs text-text-muted ">No requests yet</p>
                                    </div>
                                )}
                            </section>

                            {/* Recent Bookings */}
                            {patient.bookingsForPatient?.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold text-text-muted  uppercase tracking-widest mb-3">
                                        Recent Bookings
                                    </h3>
                                    <div className="space-y-2">
                                        {patient.bookingsForPatient.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex items-center justify-between p-3 bg-muted-light  rounded-lg border border-border-light "
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-text-main ">
                                                        {booking.therapist?.fullName || "Therapist"}
                                                    </p>
                                                    <p className="text-[11px] text-text-muted ">
                                                        {booking.sessionType} · {formatShortDate(booking.scheduledDate)}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted ">
                                                    {booking.status?.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    ) : null}
                </div>
            </aside>
        </>
    );
}