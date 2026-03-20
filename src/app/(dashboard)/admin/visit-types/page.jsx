"use client";

import { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdCheckCircle, MdCancel } from "react-icons/md";
import { api } from "@/lib/api";
import { usePageTitle } from "@/hooks/usePageTitle";

const DISCIPLINES = ["Physical Therapist", "Occupational Therapist", "Speech Therapist", "All"];

export default function AdminVisitTypesPage() {
    usePageTitle("Visit Types");
    const [visitTypes, setVisitTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ code: "", name: "", discipline: "", sortOrder: 0 });
    const [saving, setSaving] = useState(false);
    const [seeding, setSeeding] = useState(false);

    const fetchVisitTypes = async () => {
        try {
            const res = await api.get("/admin/visit-types");
            setVisitTypes(res.data.data || []);
        } catch (err) {
            console.error("Failed to load visit types", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVisitTypes(); }, []);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            const res = await api.post("/admin/visit-types/seed");
            alert(`Seeded: ${res.data.data.created} created, ${res.data.data.skipped} already existed`);
            fetchVisitTypes();
        } catch (err) {
            alert("Seed failed: " + (err.response?.data?.message || err.message));
        } finally {
            setSeeding(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/admin/visit-types/${editingId}`, formData);
            } else {
                await api.post("/admin/visit-types", formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ code: "", name: "", discipline: "", sortOrder: 0 });
            fetchVisitTypes();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (vt) => {
        setEditingId(vt.id);
        setFormData({ code: vt.code, name: vt.name, discipline: vt.discipline, sortOrder: vt.sortOrder });
        setShowForm(true);
    };

    const handleToggleActive = async (vt) => {
        try {
            await api.put(`/admin/visit-types/${vt.id}`, { isActive: !vt.isActive });
            fetchVisitTypes();
        } catch (err) {
            alert("Failed to update");
        }
    };

    const grouped = DISCIPLINES.reduce((acc, d) => {
        acc[d] = visitTypes.filter(vt => vt.discipline === d);
        return acc;
    }, {});

    if (loading) return <div className="p-4 md:p-6"><p className="text-text-muted">Loading...</p></div>;

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-main dark:text-white">Visit Types</h1>
                    <p className="text-sm text-text-muted mt-1">Manage clinical session types for therapist offers</p>
                </div>
                <div className="flex gap-3">
                    {visitTypes.length === 0 && (
                        <button
                            onClick={handleSeed}
                            disabled={seeding}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
                        >
                            {seeding ? "Seeding..." : "Seed Default Types"}
                        </button>
                    )}
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setFormData({ code: "", name: "", discipline: "", sortOrder: 0 }); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90"
                    >
                        <MdAdd className="text-lg" /> Add Visit Type
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl space-y-4">
                    <p className="text-sm font-bold text-text-main dark:text-white">{editingId ? "Edit Visit Type" : "New Visit Type"}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase">Code</label>
                            <input
                                type="text"
                                required
                                maxLength={10}
                                value={formData.code}
                                onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                placeholder="PTE"
                                className="w-full mt-1 rounded-lg border-border-light dark:border-border-dark dark:bg-slate-800 dark:text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                placeholder="Physical Therapist Evaluation"
                                className="w-full mt-1 rounded-lg border-border-light dark:border-border-dark dark:bg-slate-800 dark:text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase">Discipline</label>
                            <select
                                required
                                value={formData.discipline}
                                onChange={e => setFormData(p => ({ ...p, discipline: e.target.value }))}
                                className="w-full mt-1 rounded-lg border-border-light dark:border-border-dark dark:bg-slate-800 dark:text-white text-sm"
                            >
                                <option value="">Select discipline</option>
                                {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase">Sort Order</label>
                            <input
                                type="number"
                                value={formData.sortOrder}
                                onChange={e => setFormData(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                                className="w-full mt-1 rounded-lg border-border-light dark:border-border-dark dark:bg-slate-800 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
                            {saving ? "Saving..." : editingId ? "Update" : "Create"}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 text-text-muted text-sm hover:text-text-main">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {Object.entries(grouped).map(([discipline, types]) => types.length > 0 && (
                <div key={discipline} className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-sm font-bold text-text-main dark:text-white">{discipline}</h3>
                        <p className="text-xs text-text-muted">{types.length} visit type{types.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="divide-y divide-border-light dark:divide-border-dark">
                        {types.map(vt => (
                            <div key={vt.id} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded">{vt.code}</span>
                                    <span className={`text-sm font-medium ${vt.isActive ? "text-text-main dark:text-white" : "text-text-muted line-through"}`}>
                                        {vt.name}
                                    </span>
                                    {!vt.isActive && (
                                        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">INACTIVE</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleToggleActive(vt)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title={vt.isActive ? "Deactivate" : "Activate"}>
                                        {vt.isActive ? <MdCheckCircle className="text-emerald-500" /> : <MdCancel className="text-red-400" />}
                                    </button>
                                    <button onClick={() => handleEdit(vt)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
                                        <MdEdit className="text-text-muted" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {visitTypes.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-text-muted">No visit types configured yet.</p>
                    <p className="text-sm text-text-muted mt-1">Click "Seed Default Types" to populate the standard clinical visit types.</p>
                </div>
            )}
        </div>
    );
}