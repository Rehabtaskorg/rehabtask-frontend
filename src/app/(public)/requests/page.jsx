"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdSearch, MdLocationOn, MdChevronLeft, MdChevronRight, MdWork, MdInfo, MdArrowForward } from "react-icons/md";
import RequestPublicCard from "@/components/public/RequestPublicCard";
import AuthGateModal from "@/components/public/AuthGateModal";
import CTABanner from "@/components/public/CTABanner";

const SAMPLE_REQUESTS = [
    { id: "1", serviceType: "Physical Therapy", description: "Post-stroke neurological rehabilitation. Focus on gait training, upper extremity strengthening, and functional mobility for a 68-year-old male patient transitioning from inpatient rehab.", locationCity: "Los Angeles, CA", visitsPerWeek: 3, numberOfWeeks: 8, preferredDate: "2026-04-15T00:00:00Z", visitType: "in-person", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), offerCount: 4 },
    { id: "2", serviceType: "Occupational Therapy", description: "ADL training post-surgical shoulder. Assist 54-year-old female with home safety evaluation and activities of daily living training following a rotator cuff repair.", locationCity: "Santa Monica, CA", visitsPerWeek: 2, numberOfWeeks: 6, preferredDate: "2026-04-20T00:00:00Z", visitType: "in-person", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), offerCount: 2 },
    { id: "3", serviceType: "Speech Language Pathology (SLP)", description: "Dysphagia management and speech training. Speech-language evaluation and swallow therapy for an elderly patient with progressive Parkinson's disease.", locationCity: "Pasadena, CA", visitsPerWeek: 1, numberOfWeeks: 12, preferredDate: null, visitType: "virtual", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), offerCount: 0 },
    { id: "4", serviceType: "Physical Therapy", description: "Chronic lower back pain management requiring manual therapy and progressive exercise program. Patient is a 45-year-old office worker with L4-L5 disc herniation.", locationCity: "Beverly Hills, CA", visitsPerWeek: 3, numberOfWeeks: 6, preferredDate: "2026-04-10T00:00:00Z", visitType: "in-person", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), offerCount: 6 },
    { id: "5", serviceType: "Occupational Therapy", description: "Pediatric sensory integration therapy. Occupational therapy for 7-year-old child with ASD focusing on fine motor skills and sensory processing at home.", locationCity: "Burbank, CA", visitsPerWeek: 2, numberOfWeeks: 10, preferredDate: "2026-05-01T00:00:00Z", visitType: "in-person", createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), offerCount: 7 },
    { id: "6", serviceType: "Physical Therapy", description: "Total knee replacement recovery. Post-operative rehabilitation for bilateral knee arthroplasty. Patient requires home-based therapy including ROM exercises and gait training.", locationCity: "Glendale, CA", visitsPerWeek: 3, numberOfWeeks: 8, preferredDate: "2026-04-18T00:00:00Z", visitType: "in-person", createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), offerCount: 3 },
];

const DISCIPLINE_FILTERS = [
    { key: "all", label: "All" },
    { key: "pt", label: "PT" },
    { key: "ot", label: "OT" },
    { key: "slp", label: "SLP" },
];

const ITEMS_PER_PAGE = 4;

export default function BrowseRequestsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [activeDiscipline, setActiveDiscipline] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [gateOpen, setGateOpen] = useState(false);
    const [gateTrigger, setGateTrigger] = useState("default");

    const handleAuthGate = (trigger) => {
        setGateTrigger(trigger);
        setGateOpen(true);
    };

    const filtered = useMemo(() => {
        let list = SAMPLE_REQUESTS;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((r) => r.description.toLowerCase().includes(q) || r.serviceType.toLowerCase().includes(q));
        }
        if (activeDiscipline !== "all") {
            const map = { pt: "Physical Therapy", ot: "Occupational Therapy", slp: "Speech Language Pathology" };
            list = list.filter((r) => r.serviceType.includes(map[activeDiscipline]));
        }
        return list;
    }, [searchQuery, activeDiscipline]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <>
            <div className="pt-16 min-h-screen bg-white">
                {/* Header */}
                <section className="bg-gray-50 border-b border-gray-200 py-10 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Open Therapy Requests</h1>
                        <p className="text-gray-500 mb-8">Home health agencies are looking for licensed therapists to provide specialized home care.</p>

                        <div className="flex flex-col md:flex-row gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex gap-1.5 p-1 bg-gray-50 rounded-lg">
                                {DISCIPLINE_FILTERS.map((d) => (
                                    <button
                                        key={d.key}
                                        onClick={() => { setActiveDiscipline(d.key); setCurrentPage(1); }}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                            activeDiscipline === d.key
                                                ? "bg-[#137fec] text-white"
                                                : "text-gray-500 hover:bg-gray-100"
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 relative">
                                <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                    placeholder="Location (City or Zip)"
                                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-[#137fec]/20 rounded-lg pl-11 pr-4 py-3 text-gray-900 placeholder:text-gray-400 text-sm"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    placeholder="Search conditions, keywords..."
                                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-[#137fec]/20 rounded-lg pl-11 pr-4 py-3 text-gray-900 placeholder:text-gray-400 text-sm"
                                />
                            </div>
                            <button className="bg-[#137fec] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#137fec]/90 transition-colors text-sm shrink-0">
                                Find Jobs
                            </button>
                        </div>

                        <p className="mt-4 text-sm text-gray-500">{filtered.length} open request{filtered.length !== 1 ? "s" : ""}</p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Request cards */}
                        <div className="lg:col-span-8 space-y-5">
                            {paginated.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-gray-500">No requests match your search criteria.</p>
                                </div>
                            ) : (
                                paginated.map((r, i) => (
                                    <RequestPublicCard key={r.id} request={r} index={i} onAuthGate={handleAuthGate} />
                                ))
                            )}

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#137fec] disabled:opacity-30 transition-colors"
                                    >
                                        <MdChevronLeft className="text-lg" /> Previous
                                    </button>
                                    <div className="flex gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${
                                                    currentPage === page
                                                        ? "bg-[#137fec] text-white"
                                                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#137fec] disabled:opacity-30 transition-colors"
                                    >
                                        Next <MdChevronRight className="text-lg" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4 space-y-6">
                            {/* Join as Therapist CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-7 relative overflow-hidden group"
                            >
                                <div className="relative z-10">
                                    <div className="bg-[#137fec]/10 w-12 h-12 rounded-lg flex items-center justify-center mb-5">
                                        <MdWork className="text-[#137fec] text-2xl" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Join as a Therapist</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-5">
                                        Unlock full patient details, send offers, and manage your caseload with our therapist portal.
                                    </p>
                                    <Link
                                        href="/register/therapist"
                                        className="block w-full text-center bg-[#137fec] text-white font-semibold py-3.5 rounded-xl hover:bg-[#137fec]/90 transition-colors text-sm"
                                    >
                                        Complete Your Profile
                                    </Link>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#137fec]/5 rounded-full blur-2xl group-hover:bg-[#137fec]/10 transition-colors" />
                            </motion.div>

                            {/* How it Works */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="bg-white border border-gray-200 rounded-xl p-7"
                            >
                                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                                    <MdInfo className="text-[#137fec] text-lg" /> How It Works
                                </h3>
                                <div className="space-y-5">
                                    {[
                                        { step: "1", title: "Browse Listings", desc: "View therapy needs in your area from top health agencies." },
                                        { step: "2", title: "Verify Credentials", desc: "One-time background and license check for security." },
                                        { step: "3", title: "Send Offers", desc: "Apply to cases and coordinate directly with agencies." },
                                    ].map((item) => (
                                        <div key={item.step} className="flex gap-4">
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-[#137fec]">
                                                {item.step}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</p>
                                                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-5 border-t border-gray-100">
                                    <Link href="/register/therapist" className="text-[#137fec] text-xs font-semibold flex items-center justify-center gap-1 hover:underline">
                                        Learn more about RehabTask <MdArrowForward className="text-sm" />
                                    </Link>
                                </div>
                            </motion.div>
                        </aside>
                    </div>
                </section>

                <CTABanner />
            </div>

            <AuthGateModal
                isOpen={gateOpen}
                onClose={() => setGateOpen(false)}
                trigger={gateTrigger}
                redirectPath="/requests"
            />
        </>
    );
}
