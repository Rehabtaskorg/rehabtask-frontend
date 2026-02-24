"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
    MdLocationOn, MdCalendarToday, MdSend, MdChatBubble,
    MdCheckCircle, MdWarning, MdError, MdAccessTime,
    MdFilterList, MdClose, MdTune
} from "react-icons/md";

// Helpers
const getServiceTypeStyle = (serviceType) => {
    const st = serviceType?.toLowerCase() || '';
    if (st.includes('physical') || st.includes('pt'))
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (st.includes('occupational') || st.includes('ot'))
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    if (st.includes('speech') || st.includes('slp'))
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Yesterday' : `${days}d ago`;
};

const getMyOffer = (req) => req?.offers?.[0] ?? null;
const hasMyOffer = (req) => Boolean(req?.offers?.length);

const SERVICE_TYPE_OPTIONS = [
    { label: 'Physical Therapy (PT)', value: 'physical' },
    { label: 'Occupational Therapy (OT)', value: 'occupational' },
    { label: 'Speech-Language (SLP)', value: 'speech' },
    { label: 'Other', value: 'other' },
];

export default function TherapistRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');
    const [filters, setFilters] = useState({
        serviceTypes: [],
        distance: '10',
        show: 'all',
    });
    const [offerData, setOfferData] = useState({
        rate: '',
        sessionType: 'in-person',
        proposedDate: '',
        description: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [offerSuccess, setOfferSuccess] = useState(false);
    const [offerError, setOfferError] = useState('');

    // Mobile state
    const [mobileView, setMobileView] = useState('list');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const fetchRequests = async () => {
        try {
            const res = await api.get("/requests/available");
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            setRequests(data);
            setFiltered(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchRequests(); }, []);

    // Filter + Sort
    const applyFilters = useCallback(() => {
        let result = [...requests];
        if (filters.serviceTypes.length > 0) {
            result = result.filter(r =>
                filters.serviceTypes.some(t => r.serviceType?.toLowerCase().includes(t))
            );
        }
        if (filters.show === 'new') {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
            result = result.filter(r => new Date(r.createdAt) > cutoff);
        } else if (filters.show === 'my_offers') {
            result = result.filter(r => hasMyOffer(r));
        }
        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setFiltered(result);
    }, [requests, filters, sortBy]);

    useEffect(() => { applyFilters(); }, [applyFilters]);

    const toggleServiceType = (val) => {
        setFilters(prev => ({
            ...prev,
            serviceTypes: prev.serviceTypes.includes(val)
                ? prev.serviceTypes.filter(v => v !== val)
                : [...prev.serviceTypes, val],
        }));
    };

    const resetFilters = () => setFilters({ serviceTypes: [], distance: '10', show: 'all' });

    // Select
    const handleSelectRequest = (req) => {
        setSelectedRequest(req);
        setMobileView('detail');
        setOfferSuccess(false);
        setOfferError('');
        if (req.preferredDate) {
            const d = new Date(req.preferredDate);
            const localDT = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            setOfferData({ rate: '', sessionType: 'in-person', proposedDate: localDT, description: '' });
        }
    };

    const handleBackToList = () => {
        setMobileView('list');
        setSelectedRequest(null);
    };

    // Submit new offer
    const handleSubmitOffer = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setOfferError('');
        try {
            await api.post("/offers", {
                requestId: selectedRequest.id,
                rate: parseFloat(offerData.rate),
                sessionType: offerData.sessionType,
                proposedDate: new Date(offerData.proposedDate).toISOString(),
                description: offerData.description,
            });
            setOfferSuccess(true);
            const res = await api.get("/requests/available");
            const updated = Array.isArray(res.data.data) ? res.data.data : [];
            setRequests(updated);
            const fresh = updated.find(r => r.id === selectedRequest.id);
            if (fresh) setSelectedRequest(fresh);
        } catch (error) {
            setOfferError(error.response?.data?.message || 'Failed to send offer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    // Update/revise an existing offer (for change_requested flow)
    const handleReviseOffer = async (e) => {
        e.preventDefault();
        const myOffer = getMyOffer(selectedRequest);
        if (!myOffer) return;
        setSubmitting(true);
        setOfferError('');
        try {
            await api.put(`/offers/${myOffer.id}/revise`, {
                rate: parseFloat(offerData.rate),
                sessionType: offerData.sessionType,
                proposedDate: new Date(offerData.proposedDate).toISOString(),
                description: offerData.description,
            });
            setOfferSuccess(true);
            const res = await api.get("/requests/available");
            const updated = Array.isArray(res.data.data) ? res.data.data : [];
            setRequests(updated);
            const fresh = updated.find(r => r.id === selectedRequest.id);
            if (fresh) setSelectedRequest(fresh);
        } catch (error) {
            setOfferError(error.response?.data?.message || 'Failed to update offer. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMessageCustomer = (offerId) => {
        router.push(`/therapist/messages?c=offer:${offerId}`);
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-3.5rem)] lg:h-full overflow-hidden pt-0">
                <div className="hidden lg:block w-60 border-r border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-5 shrink-0">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                        ))}
                    </div>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-background-dark p-4 space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="animate-pulse bg-white dark:bg-card-dark rounded-lg p-4 h-28 border border-slate-200 dark:border-border-dark" />
                    ))}
                </div>
                <div className="hidden lg:flex w-96 border-l border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark p-6 shrink-0">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-3.5rem)] lg:h-full overflow-hidden">

            {/* ── PANEL 1: Filters ─────────────────────────────────────────── */}
            <aside className={`
                border-r border-slate-200 dark:border-border-dark
                bg-white dark:bg-card-dark p-5 overflow-y-auto panel-scroll shrink-0
                w-72 fixed inset-y-0 left-0 z-30 transition-transform duration-300
                ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:w-60
            `}>
                <button
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4 hover:text-slate-700"
                >
                    <MdClose className="text-lg" /> Close Filters
                </button>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <MdTune className="text-slate-400 text-lg" />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Filters</h3>
                    </div>
                    <button onClick={resetFilters} className="text-xs text-primary font-semibold hover:underline">
                        Reset
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Service Type */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Service Type</p>
                        <div className="space-y-2">
                            {SERVICE_TYPE_OPTIONS.map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.serviceTypes.includes(opt.value)}
                                        onChange={() => toggleServiceType(opt.value)}
                                        className="rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Distance (placeholder) */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Distance</p>
                        <select
                            value={filters.distance}
                            onChange={e => setFilters(prev => ({ ...prev, distance: e.target.value }))}
                            className="w-full rounded-lg border-slate-300 dark:border-border-dark dark:bg-card-dark dark:text-slate-300 text-sm focus:ring-primary focus:border-primary"
                        >
                            <option value="5">Within 5 miles</option>
                            <option value="10">Within 10 miles</option>
                            <option value="25">Within 25 miles</option>
                            <option value="50">Within 50 miles</option>
                        </select>
                        <p className="text-[10px] text-slate-400 italic">Distance filtering coming soon</p>
                    </div>

                    {/* Show */}
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Show</p>
                        <div className="space-y-2">
                            {[
                                { value: 'all', label: 'All Open' },
                                { value: 'new', label: 'New Only (24h)' },
                                { value: 'my_offers', label: 'With My Offers' },
                            ].map(opt => (
                                <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="show"
                                        value={opt.value}
                                        checked={filters.show === opt.value}
                                        onChange={() => setFilters(prev => ({ ...prev, show: opt.value }))}
                                        className="border-slate-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                                        {opt.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => { applyFilters(); setShowMobileFilters(false); }}
                        className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Apply Filters
                    </button>
                </div>
            </aside>

            {/* Mobile filter overlay */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setShowMobileFilters(false)} />
            )}

            {/* ── PANEL 2: Request Feed ─────────────────────────────────────── */}
            <section className={`
                flex-1 flex flex-col bg-slate-50 dark:bg-background-dark overflow-hidden min-w-0
                ${mobileView === 'detail' ? 'hidden lg:flex' : 'flex'}
            `}>
                {/* Mobile filter + controls bar — hidden on desktop */}
                <div className="lg:hidden flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-card-dark">
                    <button
                        onClick={() => setShowMobileFilters(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark text-sm font-medium text-slate-600 dark:text-slate-300"
                    >
                        <MdTune className="text-base" />
                        Filters
                        {(filters.serviceTypes.length > 0 || filters.show !== 'all') && (
                            <span className="bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {filters.serviceTypes.length + (filters.show !== 'all' ? 1 : 0)}
                            </span>
                        )}
                    </button>
                </div>

                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200 dark:border-border-dark bg-white/80 dark:bg-card-dark/80 backdrop-blur-sm flex items-center justify-between shrink-0">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-900 dark:text-white">{filtered.length}</strong> requests found
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Sort</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="text-sm border-none bg-transparent font-semibold text-primary focus:ring-0 cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="distance">Distance</option>
                        </select>
                    </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 panel-scroll">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center">
                            <MdFilterList className="text-4xl text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">No requests match your filters</p>
                            <button onClick={resetFilters} className="mt-2 text-sm text-primary font-semibold hover:underline">
                                Reset filters
                            </button>
                        </div>
                    ) : filtered.map(req => {
                        const isSelected = selectedRequest?.id === req.id;
                        const myOffer = getMyOffer(req);
                        const offerCount = req.offers?.length || 0;
                        return (
                            <div
                                key={req.id}
                                onClick={() => handleSelectRequest(req)}
                                className={`p-4 rounded-lg cursor-pointer transition-all ${isSelected
                                    ? 'request-card-active shadow-md'
                                    : 'bg-white dark:bg-card-dark border border-transparent hover:border-slate-300 dark:hover:border-border-dark shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getServiceTypeStyle(req.serviceType)}`}>
                                        {req.serviceType}
                                    </span>
                                    <span className="text-[11px] text-slate-400 font-medium shrink-0 ml-2">
                                        {timeAgo(req.createdAt)}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-1 leading-tight line-clamp-1">
                                    {req.description?.split('\n')[0] || req.serviceType}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                                    {req.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <MdLocationOn className="text-[15px]" />
                                            <span className="text-xs font-medium">Nearby</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <MdCalendarToday className="text-[14px]" />
                                            <span className="text-xs font-medium">
                                                {req.preferredDate
                                                    ? new Date(req.preferredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    : 'Flexible'}
                                            </span>
                                        </div>
                                    </div>
                                    {myOffer ? (
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                                            <MdCheckCircle className="text-[13px]" />
                                            My Offer Sent
                                        </span>
                                    ) : offerCount > 0 ? (
                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                            {offerCount} Offer{offerCount > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-400 px-2 py-1 rounded">No offers yet</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── PANEL 3: Detail / Offer Panel ────────────────────────────── */}
            <aside className={`
                border-l border-slate-200 dark:border-border-dark
                bg-white dark:bg-card-dark flex flex-col overflow-hidden shrink-0
                w-full lg:w-96
                ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}
            `}>
                {/* Mobile back button */}
                <button
                    onClick={handleBackToList}
                    className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-border-dark text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 shrink-0"
                >
                    ← Back to requests
                </button>

                {!selectedRequest ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="p-5 bg-primary/5 rounded-full mb-4">
                            <MdSend className="text-3xl text-primary/40" />
                        </div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300">Select a request</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Click any request to view details and send an offer
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto panel-scroll">
                        <div className="p-6 space-y-6">

                            {/* Request Header */}
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0 pr-3">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                            {selectedRequest.serviceType}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            <MdLocationOn className="text-slate-400 text-[15px] shrink-0" />
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {selectedRequest.location} · Nearby
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedRequest(null); setMobileView('list'); }}
                                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 shrink-0 hidden lg:block"
                                    >
                                        <MdClose className="text-lg" />
                                    </button>
                                </div>
                                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${getServiceTypeStyle(selectedRequest.serviceType)}`}>
                                    {selectedRequest.serviceType}
                                </span>
                            </div>

                            {/* Request Details */}
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-border-dark">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {selectedRequest.description}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg border border-slate-100 dark:border-border-dark">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferred Date</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                            {selectedRequest.preferredDate
                                                ? new Date(selectedRequest.preferredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : 'Flexible'}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg border border-slate-100 dark:border-border-dark">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Offers</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                                            {selectedRequest.offers?.length || 0} offer{selectedRequest.offers?.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Offer Status States ───────────────────────── */}
                            {(() => {
                                const myOffer = getMyOffer(selectedRequest);

                                // State 1: No offer
                                if (!myOffer) return (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Send Offer</h4>
                                            <span className="text-xs font-medium text-slate-500 italic">You earn 90% of rate</span>
                                        </div>
                                        {offerSuccess && (
                                            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                                <MdCheckCircle className="text-emerald-600 shrink-0" />
                                                <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">Offer sent successfully!</p>
                                            </div>
                                        )}
                                        {offerError && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <MdError className="text-red-600 shrink-0" />
                                                <p className="text-sm text-red-800 dark:text-red-300">{offerError}</p>
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmitOffer} className="p-5 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Rate per Session</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="1"
                                                            required
                                                            placeholder="0.00"
                                                            value={offerData.rate}
                                                            onChange={e => setOfferData(prev => ({ ...prev, rate: e.target.value }))}
                                                            className="w-full pl-7 rounded-lg border-slate-200 dark:border-border-dark dark:bg-card-dark dark:text-white font-mono text-sm focus:ring-primary focus:border-primary"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Session Type</label>
                                                    <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-border-dark gap-1">
                                                        {['in-person', 'virtual'].map(type => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                onClick={() => setOfferData(prev => ({ ...prev, sessionType: type }))}
                                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors capitalize ${offerData.sessionType === type
                                                                    ? 'bg-primary text-white'
                                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                                    }`}
                                                            >
                                                                {type === 'in-person' ? 'In-Person' : 'Virtual'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Proposed First Session</label>
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    value={offerData.proposedDate}
                                                    onChange={e => setOfferData(prev => ({ ...prev, proposedDate: e.target.value }))}
                                                    className="w-full rounded-lg border-slate-200 dark:border-border-dark dark:bg-card-dark dark:text-white text-sm focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Message to Client</label>
                                                <textarea
                                                    required
                                                    rows={3}
                                                    value={offerData.description}
                                                    onChange={e => setOfferData(prev => ({ ...prev, description: e.target.value }))}
                                                    placeholder="Explain your experience with this condition and your approach..."
                                                    className="w-full rounded-lg border-slate-200 dark:border-border-dark dark:bg-card-dark dark:text-white text-sm resize-none focus:ring-primary focus:border-primary"
                                                />
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3">
                                                <p className="text-xs text-blue-800 dark:text-blue-300">
                                                    Your offer will be valid for 48 hours. The customer will be notified and can accept within this period.
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full bg-primary text-white py-3 rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <MdSend className="text-lg" />
                                                {submitting ? 'Sending...' : 'Submit Offer'}
                                            </button>
                                        </form>
                                    </div>
                                );

                                // State 2: Pending
                                if (myOffer.status === 'pending') return (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                                            <MdAccessTime className="text-emerald-600 text-xl shrink-0" />
                                            <div>
                                                <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Offer Pending</p>
                                                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Awaiting customer response</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-100 dark:border-border-dark space-y-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Your Rate</p>
                                                    <p className="text-base font-bold text-primary mt-0.5">${parseFloat(myOffer.rate).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Session Type</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5 capitalize">{myOffer.sessionType}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Proposed Date</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                                                    {myOffer.proposedDate ? new Date(myOffer.proposedDate).toLocaleString() : '—'}
                                                </p>
                                            </div>
                                            {myOffer.expiresAt && (
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Expires</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                                                        {new Date(myOffer.expiresAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleMessageCustomer(myOffer.id)}
                                                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                                            >
                                                <MdChatBubble className="text-lg" />
                                                Message Customer
                                            </button>
                                            <button
                                                onClick={() => alert('Withdraw offer feature coming soon')}
                                                className="w-full flex items-center justify-center gap-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                Withdraw Offer
                                            </button>
                                        </div>
                                    </div>
                                );

                                // State 3: Change requested
                                if (myOffer.status === 'change_requested') return (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                                            <MdWarning className="text-amber-600 text-xl shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-amber-800 dark:text-amber-300 text-sm">Change Requested</p>
                                                {myOffer.changeRequestNote && (
                                                    <div className="mt-2 pl-3 border-l-2 border-amber-300 dark:border-amber-600">
                                                        <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                                            &quot;{myOffer.changeRequestNote}&quot;
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleMessageCustomer(myOffer.id)}
                                            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                                        >
                                            <MdChatBubble className="text-lg" />
                                            Message Customer
                                        </button>
                                        <div className="pt-4 border-t border-slate-100 dark:border-border-dark">
                                            <p className="text-xs font-bold text-slate-500 uppercase mb-3">Update Your Offer</p>
                                            <form onSubmit={handleReviseOffer} className="space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">New Rate</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="1"
                                                                required
                                                                value={offerData.rate || parseFloat(myOffer.rate).toFixed(2)}
                                                                onChange={e => setOfferData(prev => ({ ...prev, rate: e.target.value }))}
                                                                className="w-full pl-7 rounded-lg border-slate-200 dark:border-border-dark dark:bg-card-dark dark:text-white font-mono text-sm focus:ring-primary focus:border-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Session Type</label>
                                                        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-border-dark gap-1">
                                                            {['in-person', 'virtual'].map(type => (
                                                                <button
                                                                    key={type}
                                                                    type="button"
                                                                    onClick={() => setOfferData(prev => ({ ...prev, sessionType: type }))}
                                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors capitalize ${offerData.sessionType === type
                                                                        ? 'bg-primary text-white'
                                                                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                                        }`}
                                                                >
                                                                    {type === 'in-person' ? 'In-Person' : 'Virtual'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Updated Message</label>
                                                    <textarea
                                                        required
                                                        rows={3}
                                                        value={offerData.description}
                                                        onChange={e => setOfferData(prev => ({ ...prev, description: e.target.value }))}
                                                        placeholder="Address the customer's request..."
                                                        className="w-full rounded-lg border-slate-200 dark:border-border-dark dark:bg-card-dark dark:text-white text-sm resize-none focus:ring-primary focus:border-primary"
                                                    />
                                                </div>
                                                {offerError && (
                                                    <p className="text-sm text-red-600 dark:text-red-400">{offerError}</p>
                                                )}
                                                <button
                                                    type="submit"
                                                    disabled={submitting}
                                                    className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-amber-700 transition-colors disabled:opacity-60"
                                                >
                                                    {submitting ? 'Updating...' : 'Update Offer'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                );

                                // State 4: Accepted
                                if (myOffer.status === 'accepted') return (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                                            <MdCheckCircle className="text-emerald-600 text-xl shrink-0" />
                                            <div>
                                                <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Offer Accepted!</p>
                                                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">A booking has been created</p>
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-100 dark:border-border-dark">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Rate</p>
                                                    <p className="text-base font-bold text-primary mt-0.5">${parseFloat(myOffer.rate).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Your Payout</p>
                                                    <p className="text-base font-bold text-emerald-600 mt-0.5">${(parseFloat(myOffer.rate) * 0.9).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => handleMessageCustomer(myOffer.id)}
                                                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
                                            >
                                                <MdChatBubble className="text-lg" />
                                                Message Customer
                                            </button>
                                            <button
                                                onClick={() => router.push('/therapist/bookings')}
                                                className="w-full border border-primary text-primary py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors"
                                            >
                                                View My Bookings
                                            </button>
                                        </div>
                                    </div>
                                );

                                // State 5: Rejected / expired / withdrawn
                                const statusLabels = {
                                    rejected: 'Offer Rejected',
                                    expired: 'Offer Expired',
                                    withdrawn: 'Offer Withdrawn',
                                };
                                return (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-border-dark rounded-xl">
                                            <MdError className="text-slate-400 text-xl shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                                    {statusLabels[myOffer.status] || 'Offer Inactive'}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">You can send a new offer for this request</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedRequest({ ...selectedRequest, offers: [] })}
                                            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MdSend className="text-lg" />
                                            Send New Offer
                                        </button>
                                    </div>
                                );
                            })()}

                        </div>
                    </div>
                )}
            </aside>

        </div>
    );

}