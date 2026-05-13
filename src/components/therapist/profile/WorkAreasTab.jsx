"use client";

import { useState } from "react";
import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import {
    MdAdd,
    MdMap,
    MdEdit,
    MdDelete,
    MdLocationOn,
    MdTipsAndUpdates,
    MdDirectionsCar,
} from "react-icons/md";
import WorkAreaFormModal from "./WorkAreaFormModal";
import { useUpdateWorkAreas } from "@/hooks/useTherapistProfile";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };
const DEFAULT_ZOOM = 4;

/**
 * Work areas management tab on the therapist profile dashboard.
 * Allows therapists to add, edit, and delete their service locations.
 *
 * @param {Object} props
 * @param {Object} props.profile - Therapist profile with workAreas array
 */
const WorkAreasTab = ({ profile }) => {
    const [workAreas, setWorkAreas] = useState(() =>
        (profile.workAreas || []).map((wa, i) => ({ ...wa, _tempId: wa.id || `temp-${i}` }))
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState(null);
    const [alert, setAlert] = useState(null);

    const updateWorkAreas = useUpdateWorkAreas();

    const handleAdd = () => {
        setEditingArea(null);
        setModalOpen(true);
    };

    const handleEdit = (area) => {
        setEditingArea(area);
        setModalOpen(true);
    };

    const handleDelete = async (area) => {
        const remaining = workAreas.filter((wa) => wa._tempId !== area._tempId);

        const message = remaining.length === 0
            ? `Remove ${area.city}, ${area.state}? This is your last work area — without any work areas, you won't appear in customer search results.`
            : `Remove ${area.city}, ${area.state} from your work areas?`;

        if (!confirm(message)) return;

        setWorkAreas(remaining);
        setAlert(null);

        const payload = remaining.map(({ zipCode, city, state, latitude, longitude, radiusMiles }) => ({
            zipCode,
            city,
            state,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radiusMiles: parseInt(radiusMiles, 10),
        }));

        try {
            await updateWorkAreas.mutateAsync(payload);
            setAlert({ type: "success", message: "Work area removed successfully!" });
        } catch (err) {
            setWorkAreas((prev) => [...prev, area]);
            setAlert({
                type: "error",
                message: err.response?.data?.message || "Failed to remove work area. Please try again.",
            });
        }
    };

    const handleSave = (formData) => {
        if (editingArea) {
            setWorkAreas((prev) =>
                prev.map((wa) =>
                    wa._tempId === editingArea._tempId ? { ...wa, ...formData } : wa
                )
            );
        } else {
            setWorkAreas((prev) => [
                ...prev,
                { ...formData, _tempId: `temp-${Date.now()}` },
            ]);
        }
    };

    const handleSaveAll = async () => {
        setAlert(null);

        const payload = workAreas.map(({ zipCode, city, state, latitude, longitude, radiusMiles }) => ({
            zipCode,
            city,
            state,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            radiusMiles: parseInt(radiusMiles, 10),
        }));

        try {
            await updateWorkAreas.mutateAsync(payload);
            setAlert({ type: "success", message: "Work areas updated successfully!" });
        } catch (err) {
            setAlert({
                type: "error",
                message: err.response?.data?.message || "Failed to update work areas. Please try again.",
            });
        }
    };

    const firstArea = workAreas[0];
    const mapCenter =
        firstArea && !isNaN(parseFloat(firstArea.latitude))
            ? { lat: parseFloat(firstArea.latitude), lng: parseFloat(firstArea.longitude) }
            : DEFAULT_CENTER;
    const mapZoom = firstArea ? 7 : DEFAULT_ZOOM;

    return (
        <div className="space-y-6">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}

            {/* ── Service Area Map Preview ── */}
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <MdMap className="text-primary text-xl" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-text-main dark:text-white">
                                Service Area Map
                            </h2>
                            <p className="text-sm text-text-muted">
                                Your active service locations
                            </p>
                        </div>
                    </div>
                    {workAreas.length > 0 && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                            {workAreas.length} Active Location{workAreas.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                <div className="h-70">
                    <Map
                        defaultCenter={mapCenter}
                        defaultZoom={mapZoom}
                        gestureHandling="cooperative"
                        disableDefaultUI={true}
                        zoomControl={true}
                        mapId="work-areas-overview-map"
                    >
                        {workAreas.map((area) => {
                            const lat = parseFloat(area.latitude);
                            const lng = parseFloat(area.longitude);
                            if (isNaN(lat) || isNaN(lng)) return null;
                            return (
                                <AdvancedMarker
                                    key={area._tempId}
                                    position={{ lat, lng }}
                                    title={`${area.city}, ${area.state}`}
                                />
                            );
                        })}
                    </Map>
                </div>
            </div>

            {/* ── Work Areas Table ── */}
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark">
                    <div>
                        <h3 className="text-base font-bold text-text-main dark:text-white">
                            Work Areas
                        </h3>
                        <p className="text-sm text-text-muted">
                            {workAreas.length} area{workAreas.length !== 1 ? "s" : ""} configured
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAdd}>
                        <MdAdd className="text-lg" />
                        Add Area
                    </Button>
                </div>

                {workAreas.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <MdMap className="text-4xl text-text-muted mx-auto mb-3" />
                        <p className="text-text-muted font-medium">No work areas defined</p>
                        <p className="text-sm text-text-muted mt-1">
                            Add the cities or areas where you provide therapy services.
                            Without work areas, you won&apos;t appear in customer search results.
                        </p>
                        <Button variant="outline" size="sm" onClick={handleAdd} className="mt-4">
                            <MdAdd className="text-lg" />
                            Add Your First Work Area
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* ── Desktop Table ── */}
                        <div className="hidden md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border-light dark:border-border-dark">
                                        <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wide px-6 py-3">City</th>
                                        <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wide px-6 py-3">State</th>
                                        <th className="text-left text-xs font-bold text-text-muted uppercase tracking-wide px-6 py-3">ZIP</th>
                                        <th className="text-right text-xs font-bold text-text-muted uppercase tracking-wide px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workAreas.map((area) => (
                                        <tr
                                            key={area._tempId}
                                            className="border-b border-border-light dark:border-border-dark last:border-b-0 hover:bg-muted-light dark:hover:bg-muted-dark transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <MdLocationOn className="text-primary text-base shrink-0" />
                                                    <span className="text-sm font-medium text-text-main dark:text-white">{area.city}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-main dark:text-white">{area.state}</td>
                                            <td className="px-6 py-4 text-sm text-text-main dark:text-white font-mono">{area.zipCode || "—"}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button type="button" onClick={() => handleEdit(area)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors" aria-label="Edit work area">
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDelete(area)} className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" aria-label="Delete work area">
                                                        <MdDelete className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards ── */}
                        <div className="md:hidden divide-y divide-border-light dark:divide-border-dark">
                            {workAreas.map((area) => (
                                <div key={area._tempId} className="px-6 py-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1.5 bg-primary/10 rounded-lg mt-0.5">
                                                <MdLocationOn className="text-primary text-base" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-text-main dark:text-white">{area.city}, {area.state}</p>
                                                {area.zipCode && (
                                                    <p className="text-xs text-text-muted mt-0.5">ZIP {area.zipCode}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => handleEdit(area)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/5 transition-colors" aria-label="Edit">
                                                <MdEdit className="text-lg" />
                                            </button>
                                            <button type="button" onClick={() => handleDelete(area)} className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" aria-label="Delete">
                                                <MdDelete className="text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-6 py-3 border-t border-border-light dark:border-border-dark">
                            <p className="text-xs text-text-muted">
                                Showing {workAreas.length} work area{workAreas.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* ── Helper Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg shrink-0">
                            <MdTipsAndUpdates className="text-yellow-600 dark:text-yellow-400 text-lg" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">Coverage Tip</h4>
                            <p className="text-xs text-text-muted leading-relaxed">
                                Add multiple cities or areas to appear in more patient searches.
                                Patients near your service locations will see you as a nearby provider.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg shrink-0">
                            <MdDirectionsCar className="text-blue-600 dark:text-blue-400 text-lg" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-text-main dark:text-white mb-1">Travel Preference</h4>
                            <p className="text-xs text-text-muted leading-relaxed">
                                Add the cities and areas you are willing to travel to for
                                in-person sessions. You can add as many locations as you need.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Save Button ── */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSaveAll}
                    loading={updateWorkAreas.isPending}
                    disabled={workAreas.length === 0}
                >
                    Save Changes
                </Button>
            </div>

            {/* ── Modal ── */}
            <WorkAreaFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                workArea={editingArea}
                onSave={handleSave}
            />
        </div>
    );
};

export default WorkAreasTab;