"use client";

import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePatients, useUpdatePatient } from "@/hooks/usePatients";
import AddPatientModal from "@/components/customer/AddPatientModal";
import {
    MdAdd, MdEmail, MdPhone, MdPerson, MdEdit,
    MdClose, MdCheck, MdArrowBack, MdSchedule,
} from "react-icons/md";

export default function PatientsPage() {
    usePageTitle("My Patients");
    const { data: patients, isLoading, error } = usePatients();
    const updatePatient = useUpdatePatient();

    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

    // Edit mode
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: "", email: "", phone: "" });
    const [editError, setEditError] = useState("");

    const selectedPatient = patients?.find((p) => p.id === selectedPatientId) || null;

    const handleSelectPatient = (patient) => {
        setSelectedPatientId(patient.id);
        setMobileDetailOpen(true);
        setEditing(false);
    };

    const handleStartEdit = () => {
        if (!selectedPatient) return;
        setEditForm({
            fullName: selectedPatient.fullName,
            email: selectedPatient.email,
            phone: selectedPatient.phone || "",
        });
        setEditError("");
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditError("");
    };

    const handleSaveEdit = async () => {
        if (!editForm.fullName.trim() || !editForm.email.trim()) {
            setEditError("Name and email are required.");
            return;
        }
        setEditError("");
        try {
            await updatePatient.mutateAsync({
                id: selectedPatientId,
                data: {
                    fullName: editForm.fullName.trim(),
                    email: editForm.email.trim(),
                    phone: editForm.phone.trim() || undefined,
                },
            });
            setEditing(false);
        } catch (err) {
            setEditError(err.response?.data?.message || "Failed to update patient.");
        }
    };

    const getInitials = (name) =>
        name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main dark:text-white">
                    My Patients
                </h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                >
                    <MdAdd className="text-lg" />
                    Add Patient
                </button>
            </header>

            {/* Two-panel body */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* LEFT PANEL */}
                <section className="w-full lg:w-[55%] flex flex-col overflow-hidden border-r-0 lg:border-r border-border-light dark:border-border-dark">
                    <div className="flex-1 overflow-y-auto panel-scroll">
                        {isLoading ? (
                            <div className="animate-pulse space-y-3 p-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-20 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="flex-1 flex items-center justify-center py-16">
                                <p className="text-text-muted dark:text-gray-400 text-sm">Failed to load patients.</p>
                            </div>
                        ) : !patients || patients.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center py-16">
                                <div className="text-center space-y-3">
                                    <MdPerson className="text-5xl text-slate-200 dark:text-slate-700 mx-auto" />
                                    <p className="text-text-muted dark:text-gray-400 text-sm">No patients yet. Add your first patient to get started.</p>
                                    <button onClick={() => setShowAddModal(true)} className="text-primary hover:underline text-sm font-bold">
                                        Add Your First Patient
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 p-4">
                                {patients.map((patient) => {
                                    const isSelected = selectedPatientId === patient.id;
                                    return (
                                        <button
                                            key={patient.id}
                                            onClick={() => handleSelectPatient(patient)}
                                            className={`w-full text-left p-4 rounded-xl transition-all ${isSelected ? "request-card-active shadow-md" : "border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark hover:shadow-sm"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                    {getInitials(patient.fullName)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold text-text-main dark:text-white truncate">{patient.fullName}</h3>
                                                    <p className="text-xs text-text-muted dark:text-gray-400 truncate">{patient.email}</p>
                                                </div>
                                                {patient.phone && (
                                                    <span className="text-xs text-text-muted dark:text-gray-400 hidden sm:block">{patient.phone}</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* RIGHT PANEL (desktop) */}
                <section className="hidden lg:flex lg:w-[45%] flex-col overflow-hidden">
                    {selectedPatient ? (
                        <PatientDetailPanel patient={selectedPatient} editing={editing} editForm={editForm} editError={editError} saving={updatePatient.isPending} onStartEdit={handleStartEdit} onCancelEdit={handleCancelEdit} onSaveEdit={handleSaveEdit} onEditFormChange={setEditForm} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center space-y-2">
                                <MdPerson className="text-5xl text-slate-200 dark:text-slate-700 mx-auto" />
                                <p className="text-text-muted dark:text-gray-500 text-sm">Select a patient to view details</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* MOBILE DETAIL OVERLAY */}
                {mobileDetailOpen && selectedPatient && (
                    <section className="absolute inset-0 z-20 bg-background-light dark:bg-background-dark flex flex-col overflow-hidden lg:hidden">
                        <div className="shrink-0 px-4 py-3 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
                            <button onClick={() => setMobileDetailOpen(false)} className="flex items-center gap-1 text-sm text-text-muted dark:text-gray-400 hover:text-primary transition-colors">
                                <MdArrowBack className="text-base" /> Back to list
                            </button>
                        </div>
                        <PatientDetailPanel patient={selectedPatient} editing={editing} editForm={editForm} editError={editError} saving={updatePatient.isPending} onStartEdit={handleStartEdit} onCancelEdit={handleCancelEdit} onSaveEdit={handleSaveEdit} onEditFormChange={setEditForm} />
                    </section>
                )}
            </div>

            <AddPatientModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={() => { }} />
        </div>
    )

}

function PatientDetailPanel({ patient, editing, editForm, editError, saving, onStartEdit, onCancelEdit, onSaveEdit, onEditFormChange }) {
    const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
    const inputClass = "w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div className="flex-1 overflow-y-auto panel-scroll">
            <div className="p-6 sm:p-8 border-b border-border-light dark:border-border-dark">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">{getInitials(patient.fullName)}</div>
                        <h3 className="text-lg font-bold text-text-main dark:text-white">{patient.fullName}</h3>
                    </div>
                    {!editing && (
                        <button onClick={onStartEdit} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-text-muted dark:text-gray-400">
                            <MdEdit className="text-lg" />
                        </button>
                    )}
                </div>
                {editError && <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-4">{editError}</div>}
                {editing ? (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                            <input type="text" value={editForm.fullName} onChange={(e) => onEditFormChange({ ...editForm, fullName: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-1">Email</label>
                            <input type="email" value={editForm.email} onChange={(e) => onEditFormChange({ ...editForm, email: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                            <input type="tel" value={editForm.phone} onChange={(e) => onEditFormChange({ ...editForm, phone: e.target.value })} className={inputClass} />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <button onClick={onSaveEdit} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">
                                <MdCheck className="text-base" /> {saving ? "Saving..." : "Save"}
                            </button>
                            <button onClick={onCancelEdit} className="flex items-center gap-1.5 px-4 py-2 text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white text-sm font-bold transition-colors">
                                <MdClose className="text-base" /> Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-muted-light dark:bg-muted-dark rounded-xl border border-border-light dark:border-border-dark">
                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase mb-1">Email</p>
                            <p className="text-xs font-semibold text-text-main dark:text-white truncate flex items-center gap-1.5"><MdEmail className="text-sm text-text-muted dark:text-gray-400 shrink-0" />{patient.email}</p>
                        </div>
                        <div className="p-3 bg-muted-light dark:bg-muted-dark rounded-xl border border-border-light dark:border-border-dark">
                            <p className="text-[10px] font-bold text-text-muted dark:text-gray-400 uppercase mb-1">Phone</p>
                            <p className="text-xs font-semibold text-text-main dark:text-white flex items-center gap-1.5"><MdPhone className="text-sm text-text-muted dark:text-gray-400 shrink-0" />{patient.phone || "—"}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-6 sm:p-8">
                <h4 className="text-xs font-bold text-text-muted dark:text-gray-400 uppercase tracking-wider mb-4">Recent Activity</h4>
                <div className="text-center py-8">
                    <MdSchedule className="text-4xl text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-text-muted dark:text-gray-400 text-sm">Viewing patient history coming soon</p>
                </div>
            </div>
        </div>
    );
}