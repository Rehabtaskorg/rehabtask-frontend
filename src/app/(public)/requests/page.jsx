"use client";

import { useState, useCallback, useRef } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdSearch, MdChevronLeft, MdChevronRight, MdWork, MdInfo, MdArrowForward } from "react-icons/md";
import { usePublicRequests } from "@/hooks/usePublic";
import RequestPublicCard from "@/components/public/RequestPublicCard";
import LocationAutocomplete from "@/components/public/LocationAutocomplete";
import AuthGateModal from "@/components/public/AuthGateModal";
import CTABanner from "@/components/public/CTABanner";

const DISCIPLINE_MAP = {
    pt: "Physical Therapy",
    ot: "Occupational Therapy",
    slp: "Speech Language Pathology (SLP)",
};

function BrowseRequestsContent() {
    // --- Draft inputs (not sent until Find Jobs click) ---
    const [searchInput, setSearchInput] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const locationCoords = useRef(null);

    // --- Committed values (sent to API) ---
    const [committedSearch, setCommittedSearch] = useState("");
    const [committedCoords, setCommittedCoords] = useState(null);

    // --- Discipline tabs (applied immediately) ---
    const [activeDiscipline, setActiveDiscipline] = useState("all");

    // --- Pagination ---
    const [currentPage, setCurrentPage] = useState(1);

    // --- Auth gate ---
    const [gateOpen, setGateOpen] = useState(false);
    const [gateTrigger, setGateTrigger] = useState("default");

    const handleLocationSelect = useCallback((place) => {
        locationCoords.current = { latitude: place.latitude, longitude: place.longitude };
    }, []);

    const handleLocationClear = useCallback(() => {
        locationCoords.current = null;
    }, []);

    const handleSearch = useCallback(() => {
        setCommittedSearch(searchInput.trim());
        setCommittedCoords(locationCoords.current ? { ...locationCoords.current } : null);
        setCurrentPage(1);
    }, [searchInput]);

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    const handleDisciplineChange = useCallback((d) => {
        setActiveDiscipline(d);
        setCurrentPage(1);
    }, []);

    const params = {
        ...(committedSearch && { search: committedSearch }),
        ...(committedCoords && {
            latitude: committedCoords.latitude,
            longitude: committedCoords.longitude,
            radiusMiles: 50,
        }),
        ...(activeDiscipline !== "all" && { serviceType: DISCIPLINE_MAP[activeDiscipline] }),
        page: currentPage,
        limit: 6,
    };

    const { data, isLoading, isFetching } = usePublicRequests(params);
    const requests = data?.requests || [];
    const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

    const handleAuthGate = (trigger) => {
        setGateTrigger(trigger);
        setGateOpen(true);
    };

    return (
        <>
            <div className="pt-16 min-h-screen bg-white">
                {/* Header */}
                <section className="bg-gray-50 border-b border-gray-200 py-10 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Open Therapy Requests</h1>
                        <p className="text-gray-500 mb-8">Home health agencies are looking for licensed therapists to provide specialized home care.</p>

                        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex gap-1.5 p-1 bg-gray-50 rounded-lg">
                                {[{ key: "all", label: "All" }, { key: "pt", label: "PT" }, { key: "ot", label: "OT" }, { key: "slp", label: "SLP" }].map((d) => (
                                    <button
                                        key={d.key}
                                        type="button"
                                        onClick={() => handleDisciplineChange(d.key)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                            activeDiscipline === d.key ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                            <LocationAutocomplete
                                value={locationInput}
                                onChange={setLocationInput}
                                onSelect={handleLocationSelect}
                                onClear={handleLocationClear}
                                placeholder="Location (City or Zip)"
                            />
                            <div className="flex-1 relative">
                                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search conditions, keywords..."
                                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 rounded-lg pl-11 pr-4 py-3 text-gray-900 placeholder:text-gray-400 text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm shrink-0"
                            >
                                Find Jobs
                            </button>
                        </form>

                        <p className="mt-4 text-sm text-gray-500">{pagination.total} open request{pagination.total !== 1 ? "s" : ""}</p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-5">
                            {isLoading ? (
                                <div className="space-y-5">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-6 animate-pulse space-y-4">
                                            <div className="flex gap-3"><div className="h-6 w-28 bg-gray-200 rounded-full" /><div className="h-4 w-16 bg-gray-200 rounded" /></div>
                                            <div className="h-4 w-full bg-gray-200 rounded" /><div className="h-4 w-2/3 bg-gray-200 rounded" />
                                            <div className="grid grid-cols-3 gap-4"><div className="h-10 bg-gray-200 rounded" /><div className="h-10 bg-gray-200 rounded" /><div className="h-10 bg-gray-200 rounded" /></div>
                                        </div>
                                    ))}
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-gray-500">No open requests match your search criteria.</p>
                                </div>
                            ) : (
                                <div className={isFetching ? "opacity-60 pointer-events-none" : ""}>
                                    <div className="space-y-5">
                                        {requests.map((r, i) => (
                                            <RequestPublicCard key={r.id} request={r} index={i} onAuthGate={handleAuthGate} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-30 transition-colors">
                                        <MdChevronLeft className="text-lg" /> Previous
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((page) => (
                                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === page ? "bg-primary text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}>
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages} className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-primary disabled:opacity-30 transition-colors">
                                        Next <MdChevronRight className="text-lg" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-6">
                            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-gray-50 border border-gray-200 rounded-xl p-7 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-5"><MdWork className="text-primary text-2xl" /></div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Join as a Therapist</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-5">Unlock full patient details, send offers, and manage your caseload with our therapist portal.</p>
                                    <Link href="/register/therapist" className="block w-full text-center bg-primary text-white font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-colors text-sm">Complete Your Profile</Link>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white border border-gray-200 rounded-xl p-7">
                                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2"><MdInfo className="text-primary text-lg" /> How It Works</h3>
                                <div className="space-y-5">
                                    {[{ step: "1", title: "Browse Listings", desc: "View therapy needs in your area from top health agencies." }, { step: "2", title: "Verify Credentials", desc: "One-time background and license check for security." }, { step: "3", title: "Send Offers", desc: "Apply to cases and coordinate directly with agencies." }].map((item) => (
                                        <div key={item.step} className="flex gap-4">
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-primary">{item.step}</div>
                                            <div><p className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</p><p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-5 border-t border-gray-100">
                                    <Link href="/register/therapist" className="text-primary text-xs font-semibold flex items-center justify-center gap-1 hover:underline">Learn more about RehabTask <MdArrowForward className="text-sm" /></Link>
                                </div>
                            </motion.div>
                        </aside>
                    </div>
                </section>

                <CTABanner />
            </div>

            <AuthGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} trigger={gateTrigger} redirectPath="/requests" />
        </>
    );
}

export default function BrowseRequestsPage() {
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <BrowseRequestsContent />
        </APIProvider>
    );
}
