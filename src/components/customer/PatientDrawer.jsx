"use client";

import { useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import {
    MdClose, MdEdit, MdEmail, MdPhone,
    MdLocationOn, MdCheck, MdAssignment,
} from "react-icons/md";
import { usePatient, useUpdatePatient } from "@/hooks/usePatients";
import AddressAutocomplete from "@/components/maps/AddressAutocomplete";
import { formatShortDate, formatRelativeDate } from "@/utils/dates";
import { BOOKING_STATUS } from "@/lib/constants";

const REQUEST_STATUS_CONFIG = {
    created:         { label: "Created",         color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
    offers_received: { label: "Offers Received",  color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
    offers_accepted: { label: "Accepted",         color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
    completed:       { label: "Completed",        color: "text-slate-500 bg-slate-50 dark:bg-slate-800" },
    cancelled:       { label: "Cancelled",        color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
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

const inputClass = "w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

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
            fullName:    patient.fullName || "",
            email:       patient.email || "",
            phone:       patient.phone || "",
            addressLine1: patient.addressLine1 || "",
            city:        patient.city || "",
            state:       patient.state || "",
            zipCode:     patient.zipCode || "",
            latitude:    patient.latitude != null ? parseFloat(patient.latitude) : null,
            longitude:   patient.longitude != null ? parseFloat(patient.longitude) : null,
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
                    fullName:     editData.fullName.trim(),
                    email:        editData.email?.trim() || "",
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

            <aside className="fixed right-0 top-0 h-full w-full max-w-120 bg-card-light dark:bg-card-dark shadow-2xl z-50 flex flex-col border-l border-border-light dark:border-border-dark transition-transform duration-300 ease-out">
                {/* Header */}
                <div className="p-6 border-b border-border-light dark:border-border-dark shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <button
                            onClick={onClose}
                            className="p-1.5 text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white rounded-lg hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
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
                            <div className="w-16 h-16 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                            </div>
                        </div>
                    ) : patient ? (
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                                {getInitials(patient.fullName)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main dark:text-white">{patient.fullName}</h2>
                                {(patient.city || patient.state) && (
                                    <p className="text-sm text-text-muted dark:text-gray-400">
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
                                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
                            </div>
                            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        </div>
                    ) : patient ? (
                        <>
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-muted-light dark:bg-muted-dark p-4 rounded-xl border border-border-light dark:border-border-dark text-center">
                                    <p className="text-2xl font-black text-primary">{totalRequests}</p>
                                    <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase mt-1">Requests</p>
                                </div>
                                <div className="bg-muted-light dark:bg-muted-dark p-4 rounded-xl border border-border-light dark:border-border-dark text-center">
                                    <p className="text-2xl font-black text-primary">{activeBookings}</p>
                                    <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase mt-1">Active Bookings</p>
                                </div>
                                <div className="bg-muted-light dark:bg-muted-dark p-4 rounded-xl border border-border-light dark:border-border-dark text-center">
                                    <p className="text-lg font-black text-primary">{lastBooking ? formatShortDate(lastBooking.scheduledDate) : "—"}</p>
                                    <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase mt-1">Last Visit</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <section>
                                <h3 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-3">
                                    Contact Information
                                </h3>

                                {editing ? (
                                    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                                        <div className="space-y-3">
                                            {editErrors.form && (
                                                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                                                    {editErrors.form}
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 mb-1">Full Name</label>
                                                <input type="text" value={editData.fullName} onChange={(e) => setEditData((d) => ({ ...d, fullName: e.target.value }))} className={inputClass} />
                                                {editErrors.fullName && <p className="text-xs text-red-500 mt-1">{editErrors.fullName}</p>}
                                            </div>
                                            <div>
                                                <AddressAutocomplete
                                                    value={addressText}
                                                    onChange={handleEditAddressChange}
                                                    onSelect={handleEditAddressSelect}
                                                    label="Address"
                                                    placeholder="Search for an address..."
                                                    error={editErrors.addressLine1}
                                                />
                                            </div>
                                            {editData.latitude != null && (
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 mb-1">City</label>
                                                        <input type="text" value={editData.city} onChange={(e) => setEditData((d) => ({ ...d, city: e.target.value }))} className={inputClass} />
                                                        {editErrors.city && <p className="text-xs text-red-500 mt-1">{editErrors.city}</p>}
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 mb-1">State</label>
                                                        <input type="text" value={editData.state} onChange={(e) => setEditData((d) => ({ ...d, state: e.target.value }))} className={inputClass} />
                                                    </div>
                                                    <div className="w-20">
                                                        <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 mb-1">Zip</label>
                                                        <input type="text" value={editData.zipCode} onChange={(e) => setEditData((d) => ({ ...d, zipCode: e.target.value }))} className={inputClass} />
                                                        {editErrors.zipCode && <p className="text-xs text-red-500 mt-1">{editErrors.zipCode}</p>}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 mb-1">
                                                    Email <span className="text-text-muted/50 font-normal">(Optional)</span>
                                                </label>
                                                <input type="email" value={editData.email} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))} className={inputClass} />
                                                {editErrors.email && <p className="text-xs text-red-500 mt-1">{editErrors.email}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 mb-1">
                                                    Phone <span className="text-text-muted/50 font-normal">(Optional)</span>
                                                </label>
                                                <div className={`flex items-center rounded-lg border overflow-hidden ${editErrors.phone ? "border-red-400 dark:border-red-600" : "border-border-light dark:border-border-dark"} bg-background-light dark:bg-background-dark`}>
                                                    <span className="px-3 py-2 text-sm text-text-muted dark:text-gray-400 border-r border-border-light dark:border-border-dark select-none bg-slate-50 dark:bg-slate-800 shrink-0">
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
                                                        className="flex-1 px-3 py-2 bg-transparent text-text-main dark:text-white text-sm focus:outline-none placeholder:text-text-muted/50"
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
                                                    className="px-4 py-2 text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white text-sm font-bold transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </APIProvider>
                                ) : (
                                    <div className="bg-muted-light dark:bg-muted-dark rounded-xl p-4 space-y-4 border border-border-light dark:border-border-dark">
                                        {patient.addressLine1 && (
                                            <div className="flex items-start gap-3">
                                                <MdLocationOn className="text-primary text-lg shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-text-main dark:text-white">{patient.addressLine1}</p>
                                                    <p className="text-xs text-text-muted dark:text-gray-400">
                                                        {[patient.city, patient.state, patient.zipCode].filter(Boolean).join(", ")}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <MdEmail className="text-primary text-lg shrink-0" />
                                            <p className="text-sm text-text-main dark:text-white">{patient.email || "—"}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MdPhone className="text-primary text-lg shrink-0" />
                                            <p className="text-sm text-text-main dark:text-white">{patient.phone || "—"}</p>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Recent Requests */}
                            <section>
                                <h3 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-3">
                                    Recent Requests
                                </h3>
                                {patient.requestsForPatient?.length > 0 ? (
                                    <div className="space-y-2">
                                        {patient.requestsForPatient.slice(0, 5).map((req) => {
                                            const config = REQUEST_STATUS_CONFIG[req.status] || REQUEST_STATUS_CONFIG.created;
                                            return (
                                                <div
                                                    key={req.id}
                                                    className="flex items-center justify-between p-3 bg-muted-light dark:bg-muted-dark rounded-lg border border-border-light dark:border-border-dark"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-text-main dark:text-white">{req.serviceType}</p>
                                                        <p className="text-[11px] text-text-muted dark:text-gray-400">{formatShortDate(req.createdAt)}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-muted-light dark:bg-muted-dark rounded-xl border border-border-light dark:border-border-dark">
                                        <MdAssignment className="text-3xl text-slate-200 dark:text-slate-700 mx-auto mb-1" />
                                        <p className="text-xs text-text-muted dark:text-gray-400">No requests yet</p>
                                    </div>
                                )}
                            </section>

                            {/* Recent Bookings */}
                            {patient.bookingsForPatient?.length > 0 && (
                                <section>
                                    <h3 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest mb-3">
                                        Recent Bookings
                                    </h3>
                                    <div className="space-y-2">
                                        {patient.bookingsForPatient.slice(0, 5).map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="flex items-center justify-between p-3 bg-muted-light dark:bg-muted-dark rounded-lg border border-border-light dark:border-border-dark"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-text-main dark:text-white">
                                                        {booking.therapist?.fullName || "Therapist"}
                                                    </p>
                                                    <p className="text-[11px] text-text-muted dark:text-gray-400">
                                                        {booking.sessionType} · {formatShortDate(booking.scheduledDate)}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-400">
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