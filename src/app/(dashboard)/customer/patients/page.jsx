"use client";

import { useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePatients, usePatient, useUpdatePatient } from "@/hooks/usePatients";
import AddPatientModal from "@/components/customer/AddPatientModal";
import {
    MdAdd, MdEmail, MdPhone, MdPerson, MdEdit, MdSearch,
    MdClose, MdCheck, MdLocationOn,
    MdChevronLeft, MdChevronRight, MdVisibility,
    MdAssignment,
} from "react-icons/md";
import { APIProvider } from "@vis.gl/react-google-maps";
import AddressAutocomplete from "@/components/maps/AddressAutocomplete";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const REQUEST_STATUS_CONFIG = {
    created: { label: "Created", color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
    offers_received: { label: "Offers Received", color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
    offers_accepted: { label: "Accepted", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
    completed: { label: "Completed", color: "text-slate-500 bg-slate-50 dark:bg-slate-800" },
    cancelled: { label: "Cancelled", color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
};

const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const formatRelativeDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function PatientsPage() {
    usePageTitle("My Patients");
    const { data: patients, isLoading, error } = usePatients();
    const updatePatient = useUpdatePatient();

    const [showAddModal, setShowAddModal] = useState(false);
    const [drawerPatientId, setDrawerPatientId] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filter + search
    const filtered = useMemo(() => {
        if (!patients) return [];
        const q = search.toLowerCase().trim();
        if (!q) return patients;
        return patients.filter((p) =>
            p.fullName?.toLowerCase().includes(q) ||
            p.city?.toLowerCase().includes(q) ||
            p.state?.toLowerCase().includes(q) ||
            p.addressLine1?.toLowerCase().includes(q) ||
            p.phone?.includes(q) ||
            p.email?.toLowerCase().includes(q)
        );
    }, [patients, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

    const openDrawer = (patientId) => setDrawerPatientId(patientId);
    const closeDrawer = () => setDrawerPatientId(null);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b border-border-light dark:border-border-dark bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div className="flex justify-between items-center px-4 sm:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">
                            My Patients
                        </h2>
                        {patients && (
                            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                                {patients.length} Total
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                    >
                        <MdAdd className="text-lg" />
                        Add Patient
                    </button>
                </div>

                {/* Search & filters */}
                <div className="px-4 sm:px-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm w-full">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-400 text-lg" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name, address, or phone..."
                            className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg pl-10 pr-4 py-2 text-sm text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-text-muted/60"
                        />
                        {search && (
                            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main dark:hover:text-white">
                                <MdClose className="text-base" />
                            </button>
                        )}
                    </div>
                    {search && (
                        <span className="text-xs text-text-muted dark:text-gray-400">
                            Showing {filtered.length} of {patients?.length || 0} patients
                        </span>
                    )}
                </div>
            </header>

            {/* Table content */}
            <div className="flex-1 overflow-auto px-4 sm:px-8 py-6">
                {isLoading ? (
                    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                        <div className="animate-pulse space-y-0">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark" />
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-text-muted dark:text-gray-400 text-sm">Failed to load patients.</p>
                    </div>
                ) : !patients || patients.length === 0 ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center space-y-3">
                            <MdPerson className="text-6xl text-slate-200 dark:text-slate-700 mx-auto" />
                            <h3 className="text-lg font-bold text-text-main dark:text-white">No patients yet</h3>
                            <p className="text-text-muted dark:text-gray-400 text-sm max-w-xs mx-auto">
                                Add your first patient to get started with managing your patient roster.
                            </p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold inline-flex items-center gap-2 transition-colors"
                            >
                                <MdAdd className="text-lg" />
                                Add Your First Patient
                            </button>
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center space-y-3">
                            <MdSearch className="text-5xl text-slate-200 dark:text-slate-700 mx-auto" />
                            <p className="text-text-muted dark:text-gray-400 text-sm">No patients match your search.</p>
                            <button onClick={() => setSearch("")} className="text-primary hover:underline text-sm font-bold">
                                Clear search
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden shadow-sm">
                        {/* Desktop table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted-light dark:bg-muted-dark border-b border-border-light dark:border-border-dark">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Patient</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Address</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Contact</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest text-center">Requests</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest">Last Activity</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                    {paginated.map((patient) => {
                                        const requestCount = patient.requestsForPatient?.length || 0;
                                        const lastRequest = patient.requestsForPatient?.[0];

                                        return (
                                            <tr
                                                key={patient.id}
                                                className="hover:bg-primary/5 dark:hover:bg-primary/5 transition-colors group cursor-pointer"
                                                onClick={() => openDrawer(patient.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                            {getInitials(patient.fullName)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-text-main dark:text-white truncate group-hover:text-primary transition-colors">
                                                                {patient.fullName}
                                                            </p>
                                                            {(patient.city || patient.state) && (
                                                                <p className="text-[11px] text-text-muted dark:text-gray-400 truncate">
                                                                    {[patient.city, patient.state].filter(Boolean).join(", ")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-muted dark:text-gray-400 max-w-48">
                                                    {patient.addressLine1 ? (
                                                        <span className="truncate block" title={`${patient.addressLine1}, ${patient.city}, ${patient.state} ${patient.zipCode}`}>
                                                            {patient.addressLine1}
                                                        </span>
                                                    ) : (
                                                        <span className="text-text-muted/50">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-text-main dark:text-white">{patient.phone || "—"}</p>
                                                    <p className="text-[11px] text-text-muted dark:text-gray-400 truncate">{patient.email || "—"}</p>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 text-[10px] font-black rounded-full ${requestCount > 0 ? "bg-primary/10 text-primary" : "bg-muted-light dark:bg-muted-dark text-text-muted dark:text-gray-400"}`}>
                                                        {requestCount}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {lastRequest ? (
                                                        <>
                                                            <p className="text-sm text-text-main dark:text-white">{formatRelativeDate(lastRequest.createdAt)}</p>
                                                            <p className="text-[11px] text-text-muted dark:text-gray-400 truncate">{lastRequest.serviceType}</p>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-text-muted/50">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openDrawer(patient.id); }}
                                                        className="p-1.5 text-text-muted dark:text-gray-400 hover:text-primary transition-colors"
                                                        title="View details"
                                                    >
                                                        <MdVisibility className="text-lg" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list */}
                        <div className="lg:hidden divide-y divide-border-light dark:divide-border-dark">
                            {paginated.map((patient) => {
                                const requestCount = patient.requestsForPatient?.length || 0;
                                return (
                                    <button
                                        key={patient.id}
                                        onClick={() => openDrawer(patient.id)}
                                        className="w-full text-left p-4 hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                {getInitials(patient.fullName)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-text-main dark:text-white truncate">{patient.fullName}</h3>
                                                <p className="text-xs text-text-muted dark:text-gray-400 truncate">
                                                    {patient.addressLine1
                                                        ? `${patient.addressLine1}, ${patient.city || ""}`
                                                        : patient.email || "No address"}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                {patient.phone && <p className="text-xs text-text-muted dark:text-gray-400">{patient.phone}</p>}
                                                {requestCount > 0 && (
                                                    <span className="inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold rounded-full bg-primary/10 text-primary mt-1">
                                                        {requestCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {filtered.length > ROWS_PER_PAGE_OPTIONS[0] && (
                            <div className="px-6 py-3 bg-muted-light dark:bg-muted-dark border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="flex items-center gap-3 text-xs text-text-muted dark:text-gray-400">
                                    <span>
                                        Showing <span className="font-bold text-text-main dark:text-white">{(safePage - 1) * rowsPerPage + 1}-{Math.min(safePage * rowsPerPage, filtered.length)}</span> of <span className="font-bold text-text-main dark:text-white">{filtered.length}</span>
                                    </span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                        className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg px-2 py-1 text-xs text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    >
                                        {ROWS_PER_PAGE_OPTIONS.map((n) => (
                                            <option key={n} value={n}>{n} / page</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={safePage <= 1}
                                        className="p-1.5 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors disabled:opacity-40"
                                    >
                                        <MdChevronLeft className="text-base" />
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (safePage <= 3) {
                                            pageNum = i + 1;
                                        } else if (safePage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = safePage - 2 + i;
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${safePage === pageNum
                                                    ? "bg-primary text-white"
                                                    : "text-text-muted dark:text-gray-400 hover:bg-muted-light dark:hover:bg-muted-dark"
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage >= totalPages}
                                        className="p-1.5 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:bg-muted-light dark:hover:bg-muted-dark transition-colors disabled:opacity-40"
                                    >
                                        <MdChevronRight className="text-base" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Slide-over Drawer */}
            {drawerPatientId && (
                <PatientDrawer
                    patientId={drawerPatientId}
                    onClose={closeDrawer}
                    onEdit={updatePatient}
                />
            )}

            <AddPatientModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { }} />
        </div>
    );
}

/* ─── Patient Detail Drawer ─── */

function PatientDrawer({ patientId, onClose, onEdit }) {
    const { data: patient, isLoading } = usePatient(patientId);
    const updatePatient = useUpdatePatient();

    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [addressText, setAddressText] = useState("");

    const handleStartEdit = () => {
        if (!patient) return;
        setEditData({
            fullName: patient.fullName || "",
            email: patient.email || "",
            phone: patient.phone || "",
            addressLine1: patient.addressLine1 || "",
            city: patient.city || "",
            state: patient.state || "",
            zipCode: patient.zipCode || "",
            latitude: patient.latitude != null ? parseFloat(patient.latitude) : null,
            longitude: patient.longitude != null ? parseFloat(patient.longitude) : null,
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
            city: result.city || "",
            state: result.state || "",
            zipCode: result.zipCode || "",
            latitude: result.latitude,
            longitude: result.longitude,
        }));
    };

    const handleEditAddressChange = (text) => {
        setAddressText(text);
        if (editData.latitude != null) {
            setEditData((d) => ({
                ...d,
                addressLine1: "",
                city: "",
                state: "",
                zipCode: "",
                latitude: null,
                longitude: null,
            }));
        }
    };

    const validateEdit = () => {
        const errs = {};
        if (!editData.fullName?.trim()) errs.fullName = "Name is required";
        if (editData.email?.trim() && !/\S+@\S+\.\S+/.test(editData.email.trim())) errs.email = "Please enter a valid email";
        if (editData.phone?.trim() && !/^\+1\d{10}$/.test(editData.phone.trim())) {
            errs.phone = "Please enter a valid 10-digit US phone number";
        }
        if (editData.zipCode?.trim() && !/^\d{5}(-\d{4})?$/.test(editData.zipCode.trim())) {
            errs.zipCode = "Enter a valid US zip code (e.g. 90210)";
        }
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
                    fullName: editData.fullName.trim(),
                    email: editData.email?.trim() || "",
                    phone: editData.phone?.trim() || "",
                    addressLine1: editData.addressLine1?.trim() || "",
                    city: editData.city?.trim() || "",
                    state: editData.state?.trim() || "",
                    zipCode: editData.zipCode?.trim() || "",
                    latitude: editData.latitude ?? null,
                    longitude: editData.longitude ?? null,
                },
            });
            setEditing(false);
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors && Array.isArray(data.errors)) {
                const fieldErrors = {};
                for (const e of data.errors) {
                    const field = e.path?.[0];
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

    const ACTIVE_BOOKING_STATUSES = ["pending", "accepted", "confirmed", "in_progress", "reschedule_requested"];

    const totalRequests = patient?.requestsForPatient?.length || 0;
    const activeBookings = patient?.bookingsForPatient?.filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status)).length || 0;
    const lastBooking = patient?.bookingsForPatient?.[0];

    const inputClass = "w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

            {/* Drawer */}
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
                                    <p className="text-lg font-black text-primary">{lastBooking ? formatDate(lastBooking.scheduledDate) : "—"}</p>
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
                                                        <p className="text-[11px] text-text-muted dark:text-gray-400">{formatDate(req.createdAt)}</p>
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
                                                        {booking.sessionType} · {formatDate(booking.scheduledDate)}
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
