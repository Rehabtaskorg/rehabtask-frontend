"use client";

import { useState, useMemo } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePatients } from "@/hooks/usePatients";
import AddPatientModal from "@/components/customer/AddPatientModal";
import PatientDrawer from "@/components/customer/PatientDrawer";
import {
    MdAdd, MdPerson, MdSearch,
    MdClose, MdChevronLeft, MdChevronRight, MdVisibility,
} from "react-icons/md";
import { formatShortDate } from "@/utils/dates";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const getInitials = (name) =>
    name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const fmtCertPeriod = (start, end) => {
    if (!start && !end) return "—";
    if (start && end) return `${formatShortDate(start)} – ${formatShortDate(end)}`;
    return formatShortDate(start || end);
};

/**
 * Agency patient management page.
 * Lists all active patients with search, pagination, and a detail drawer.
 */
export default function PatientsPage() {
    usePageTitle("My Patients");
    const { data: patients, isLoading, error } = usePatients();

    const [showAddModal, setShowAddModal] = useState(false);
    const [drawerPatientId, setDrawerPatientId] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
    const safePage   = Math.min(page, totalPages);
    const paginated  = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="border-b border-border-light  bg-white/80  backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div className="flex justify-between items-center px-4 sm:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
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

                <div className="px-4 sm:px-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative flex-1 max-w-sm w-full">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted  text-lg" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by name, address, or phone..."
                            className="w-full bg-card-light  border border-border-light  rounded-lg pl-10 pr-4 py-2 text-sm text-text-main  focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-text-muted/60"
                        />
                        {search && (
                            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main ">
                                <MdClose className="text-base" />
                            </button>
                        )}
                    </div>
                    {search && (
                        <span className="text-xs text-text-muted ">
                            Showing {filtered.length} of {patients?.length || 0} patients
                        </span>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-auto px-4 sm:px-8 py-6">
                {isLoading ? (
                    <div className="bg-card-light  rounded-xl border border-border-light  overflow-hidden">
                        <div className="animate-pulse space-y-0">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-16 border-b border-border-light  bg-card-light " />
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-text-muted  text-sm">Failed to load patients.</p>
                    </div>
                ) : !patients || patients.length === 0 ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center space-y-3">
                            <MdPerson className="text-6xl text-slate-200  mx-auto" />
                            <h3 className="text-lg font-bold text-text-main ">No patients yet</h3>
                            <p className="text-text-muted  text-sm max-w-xs mx-auto">
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
                            <MdSearch className="text-5xl text-slate-200  mx-auto" />
                            <p className="text-text-muted  text-sm">No patients match your search.</p>
                            <button onClick={() => setSearch("")} className="text-primary hover:underline text-sm font-bold">
                                Clear search
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-card-light  rounded-xl border border-border-light  overflow-hidden shadow-sm">
                        {/* Desktop table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted-light  border-b border-border-light ">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted  uppercase tracking-widest">Pt. Name</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted  uppercase tracking-widest">DOB</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted  uppercase tracking-widest">Gender</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted  uppercase tracking-widest">Cert Period</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-text-muted  uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light ">
                                    {paginated.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            className="hover:bg-primary/5  transition-colors group cursor-pointer"
                                            onClick={() => setDrawerPatientId(patient.id)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                        {getInitials(patient.fullName)}
                                                    </div>
                                                    <p className="text-sm font-bold text-text-main  truncate group-hover:text-primary transition-colors">
                                                        {patient.fullName}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-main ">
                                                {patient.dateOfBirth ? formatShortDate(patient.dateOfBirth) : <span className="text-text-muted/50">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-main ">
                                                {patient.gender
                                                    ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
                                                    : <span className="text-text-muted/50">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-main  whitespace-nowrap">
                                                {fmtCertPeriod(patient.certificationStart, patient.certificationEnd)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDrawerPatientId(patient.id); }}
                                                    className="p-1.5 text-text-muted  hover:text-primary transition-colors"
                                                    aria-label="View patient details"
                                                >
                                                    <MdVisibility className="text-lg" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list */}
                        <div className="lg:hidden divide-y divide-border-light ">
                            {paginated.map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => setDrawerPatientId(patient.id)}
                                    className="w-full text-left p-4 hover:bg-primary/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                            {getInitials(patient.fullName)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-text-main  truncate">{patient.fullName}</h3>
                                            <p className="text-xs text-text-muted  truncate">
                                                {patient.dateOfBirth ? formatShortDate(patient.dateOfBirth) : "DOB: —"}
                                                {patient.gender ? ` · ${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}` : ""}
                                            </p>
                                        </div>
                                        <p className="text-xs text-text-muted  shrink-0 text-right max-w-32">
                                            {fmtCertPeriod(patient.certificationStart, patient.certificationEnd)}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Pagination */}
                        {filtered.length > ROWS_PER_PAGE_OPTIONS[0] && (
                            <div className="px-6 py-3 bg-muted-light  border-t border-border-light  flex flex-col sm:flex-row justify-between items-center gap-3">
                                <div className="flex items-center gap-3 text-xs text-text-muted ">
                                    <span>
                                        Showing <span className="font-bold text-text-main ">{(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, filtered.length)}</span> of <span className="font-bold text-text-main ">{filtered.length}</span>
                                    </span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                                        className="bg-card-light  border border-border-light  rounded-lg px-2 py-1 text-xs text-text-main  focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                                        className="p-1.5 rounded-lg bg-card-light  border border-border-light  hover:bg-muted-light  transition-colors disabled:opacity-40"
                                    >
                                        <MdChevronLeft className="text-base" />
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5)          pageNum = i + 1;
                                        else if (safePage <= 3)       pageNum = i + 1;
                                        else if (safePage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                        else                          pageNum = safePage - 2 + i;
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${safePage === pageNum ? "bg-primary text-white" : "text-text-muted  hover:bg-muted-light "}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage >= totalPages}
                                        className="p-1.5 rounded-lg bg-card-light  border border-border-light  hover:bg-muted-light  transition-colors disabled:opacity-40"
                                    >
                                        <MdChevronRight className="text-base" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {drawerPatientId && (
                <PatientDrawer
                    patientId={drawerPatientId}
                    onClose={() => setDrawerPatientId(null)}
                />
            )}

            <AddPatientModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => {}} />
        </div>
    );
}