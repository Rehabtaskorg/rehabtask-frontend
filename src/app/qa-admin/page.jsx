"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { usePageTitle } from "@/hooks/usePageTitle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Separate axios instance — no 401 redirect interceptor
const qaApi = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

const STATUS_COLORS = {
    approved: "text-green-700 bg-green-50 border-green-200",
    review: "text-amber-700 bg-amber-50 border-amber-200",
    pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
    rejected: "text-red-700 bg-red-50 border-red-200",
};

export default function QAAdminPage() {
    usePageTitle("QA Admin");
    const [password, setPassword] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const [therapists, setTherapists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const pwRef = useRef("");

    const getHeaders = () => ({ "x-qa-password": pwRef.current });

    const fetchTherapists = useCallback(async () => {
        setLoading(true);
        try {
            const res = await qaApi.get("/qa-admin/therapists", { headers: getHeaders() });
            setTherapists(res.data.data || []);
        } catch (err) {
            if (err.response?.status === 401) {
                setAuthenticated(false);
                sessionStorage.removeItem("qa-admin-pw");
                setError("Session expired. Please re-enter password.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Check sessionStorage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem("qa-admin-pw");
        if (saved) {
            pwRef.current = saved;
            setAuthenticated(true);
        }
    }, []);

    // Fetch therapists when authenticated
    useEffect(() => {
        if (authenticated) fetchTherapists();
    }, [authenticated, fetchTherapists]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            pwRef.current = password;
            await qaApi.get("/qa-admin/therapists", { headers: { "x-qa-password": password } });
            sessionStorage.setItem("qa-admin-pw", password);
            setAuthenticated(true);
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Wrong password.");
            } else {
                setError("Connection error. Is the backend running?");
            }
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("qa-admin-pw");
        pwRef.current = "";
        setAuthenticated(false);
        setTherapists([]);
        setPassword("");
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await qaApi.put(`/qa-admin/therapists/${id}/approve`, {}, { headers: getHeaders() });
            await fetchTherapists();
        } catch (err) {
            alert("Failed to approve: " + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        setActionLoading(id);
        try {
            await qaApi.put(
                `/qa-admin/therapists/${id}/reject`,
                { rejectionReason: rejectionReason || null },
                { headers: getHeaders() }
            );
            setRejectingId(null);
            setRejectionReason("");
            await fetchTherapists();
        } catch (err) {
            alert("Failed to reject: " + (err.response?.data?.message || err.message));
        } finally {
            setActionLoading(null);
        }
    };

    // ── Password gate ──
    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">QA Admin</h1>
                    <p className="text-sm text-gray-500 mb-6">Enter the QA password to continue</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter QA password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        autoFocus
                    />
                    {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Enter
                    </button>
                </form>
            </div>
        );
    }

    // ── Authenticated view ──
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">QA Admin — Therapist Approval</h1>
                        <p className="text-sm text-gray-500 mt-1">{therapists.length} therapist(s)</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchTherapists}
                            disabled={loading}
                            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {loading && therapists.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Loading therapists...</div>
                ) : therapists.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No therapists found.</div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Specialization</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Status</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Step</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Onboarded</th>
                                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Stripe</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Created</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {therapists.map((t) => {
                                    const isRowLoading = actionLoading === t.id;
                                    const statusClass = STATUS_COLORS[t.approvalStatus] || STATUS_COLORS.pending;

                                    return (
                                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                                            <td className="py-3 px-4 font-medium text-gray-900">{t.fullName}</td>
                                            <td className="py-3 px-4 text-gray-600">{t.user?.email || "—"}</td>
                                            <td className="py-3 px-4 text-gray-600">{t.specialization || "—"}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}>
                                                    {t.approvalStatus}
                                                </span>
                                                {t.approvalStatus === "rejected" && t.rejectionReason && (
                                                    <p className="text-xs text-red-500 mt-1 max-w-40 mx-auto truncate" title={t.rejectionReason}>
                                                        {t.rejectionReason}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center text-gray-600">{t.onboardingStep}/5</td>
                                            <td className="py-3 px-4 text-center">
                                                {t.onboardingComplete ? (
                                                    <span className="text-green-600">✓</span>
                                                ) : (
                                                    <span className="text-gray-400">✗</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {t.stripeOnboardingComplete ? (
                                                    <span className="text-green-600">✓</span>
                                                ) : (
                                                    <span className="text-gray-400">✗</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                                                {new Date(t.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Reject inline form */}
                                                    {rejectingId === t.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="text"
                                                                value={rejectionReason}
                                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                                placeholder="Reason (optional)"
                                                                className="px-2 py-1 border border-gray-300 rounded text-xs w-36 focus:outline-none focus:ring-1 focus:ring-red-400"
                                                                autoFocus
                                                            />
                                                            <button
                                                                onClick={() => handleReject(t.id)}
                                                                disabled={isRowLoading}
                                                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                            >
                                                                {isRowLoading ? "..." : "Confirm"}
                                                            </button>
                                                            <button
                                                                onClick={() => { setRejectingId(null); setRejectionReason(""); }}
                                                                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {t.approvalStatus !== "approved" && (
                                                                <button
                                                                    onClick={() => handleApprove(t.id)}
                                                                    disabled={isRowLoading}
                                                                    className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                                >
                                                                    {isRowLoading ? "..." : "Approve"}
                                                                </button>
                                                            )}
                                                            {t.approvalStatus !== "rejected" && (
                                                                <button
                                                                    onClick={() => setRejectingId(t.id)}
                                                                    disabled={isRowLoading}
                                                                    className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                                                                >
                                                                    Reject
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}