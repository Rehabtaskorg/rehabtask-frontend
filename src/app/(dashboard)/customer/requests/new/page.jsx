"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function NewRequestPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        serviceType: "",
        description: "",
        preferredDate: "",
        location: "",
        latitude: "",
        longitude: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Convert date string to ISO format
            const preferredDateISO = new Date(formData.preferredDate).toISOString();

            await api.post("/requests", {
                ...formData,
                preferredDate: preferredDateISO,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
            });

            alert("Request created successfully!");
            router.push("/customer/requests");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create request");
        } finally {
            setLoading(false);
        }

    }

    return (
        <div className="py-8 px-4 max-w-2xl mx-auto">
            <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700 mb-4"
            >
                ← Back
            </button>

            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Create New Request</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Type *
                        </label>
                        <select
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={formData.serviceType}
                            onChange={(e) =>
                                setFormData({ ...formData, serviceType: e.target.value })
                            }
                        >
                            <option value="">Select service type...</option>
                            <option value="Physical Therapy">Physical Therapy (PT)</option>
                            <option value="Occupational Therapy">Occupational Therapy (OT)</option>
                            <option value="Speech Language Pathology">
                                Speech Language Pathology (SLP)
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Describe what you need help with..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Date *
                        </label>
                        <input
                            type="datetime-local"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={formData.preferredDate}
                            onChange={(e) =>
                                setFormData({ ...formData, preferredDate: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location *
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="e.g., Los Angeles, CA"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter city and state for therapist matching
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude *
                            </label>
                            <input
                                type="number"
                                step="any"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="34.0522"
                                value={formData.latitude}
                                onChange={(e) =>
                                    setFormData({ ...formData, latitude: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude *
                            </label>
                            <input
                                type="number"
                                step="any"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="-118.2437"
                                value={formData.longitude}
                                onChange={(e) =>
                                    setFormData({ ...formData, longitude: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        💡 For testing, use: LA (34.0522, -118.2437), NYC (40.7128, -74.0060)
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Creating...' : 'Create Request'}
                    </button>
                </form>
            </div>
        </div>
    );

}