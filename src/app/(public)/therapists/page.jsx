"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import TherapistSearchHeader from "@/components/public/TherapistSearchHeader";
import TherapistFilterSidebar, { FilterToggleButton } from "@/components/public/TherapistFilterSidebar";
import TherapistPublicCard from "@/components/public/TherapistPublicCard";
import AuthGateModal from "@/components/public/AuthGateModal";

const SAMPLE_THERAPISTS = [
    { id: "1", name: "Dr. Sarah Jenkins, DPT", specialization: "Orthopedic Rehabilitation", licenseType: "Licensed PT", experience: 8, location: "Los Angeles, CA", rating: 4.9, reviewCount: 124, rate: 125, photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face" },
    { id: "2", name: "Marcus Chen, MOT", specialization: "Neurological Recovery", licenseType: "Licensed OT", experience: 6, location: "Santa Monica, CA", rating: 4.8, reviewCount: 92, rate: 140, photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face" },
    { id: "3", name: "Elena Rodriguez, SLP", specialization: "Pediatric Speech Therapy", licenseType: "Licensed SLP", experience: 12, location: "Pasadena, CA", rating: 5.0, reviewCount: 210, rate: 165, photo: "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=200&h=200&fit=crop&crop=face" },
    { id: "4", name: "James Thompson, PT", specialization: "Sports Rehabilitation", licenseType: "Licensed PT", experience: 10, location: "Beverly Hills, CA", rating: 4.7, reviewCount: 78, rate: 150, photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face" },
    { id: "5", name: "Aisha Patel, OTR/L", specialization: "Geriatric Care", licenseType: "Licensed OT", experience: 9, location: "Burbank, CA", rating: 4.9, reviewCount: 156, rate: 135, photo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face" },
    { id: "6", name: "David Martinez, SLP", specialization: "Adult Speech Recovery", licenseType: "Licensed SLP", experience: 7, location: "Glendale, CA", rating: 4.6, reviewCount: 64, rate: 145, photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face" },
    { id: "7", name: "Rachel Kim, DPT", specialization: "Post-Surgical Recovery", licenseType: "Licensed PT", experience: 5, location: "Long Beach, CA", rating: 4.8, reviewCount: 88, rate: 120, photo: "https://images.unsplash.com/photo-1580281657702-257584239a55?w=200&h=200&fit=crop&crop=face" },
    { id: "8", name: "Michael O'Brien, OT", specialization: "Hand & Upper Extremity", licenseType: "Licensed OT", experience: 14, location: "Torrance, CA", rating: 4.9, reviewCount: 198, rate: 175, photo: "https://images.unsplash.com/photo-1618498082410-b4aa22193b38?w=200&h=200&fit=crop&crop=face" },
    { id: "9", name: "Lisa Nguyen, SLP", specialization: "Swallowing Disorders", licenseType: "Licensed SLP", experience: 11, location: "Irvine, CA", rating: 4.7, reviewCount: 112, rate: 155, photo: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&h=200&fit=crop&crop=face" },
];

const ITEMS_PER_PAGE = 6;

export default function FindTherapistsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [locationQuery, setLocationQuery] = useState("");
    const [activeDiscipline, setActiveDiscipline] = useState("all");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [gateOpen, setGateOpen] = useState(false);
    const [gateTrigger, setGateTrigger] = useState("default");

    const handleAuthGate = (trigger) => {
        setGateTrigger(trigger);
        setGateOpen(true);
    };

    const filtered = useMemo(() => {
        let list = SAMPLE_THERAPISTS;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter((t) => t.name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q));
        }
        if (activeDiscipline !== "all") {
            const map = { pt: "PT", ot: "OT", slp: "SLP" };
            list = list.filter((t) => t.licenseType.includes(map[activeDiscipline]));
        }
        return list;
    }, [searchQuery, activeDiscipline]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <>
            <div className="pt-16 min-h-screen bg-white">
                <TherapistSearchHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    locationQuery={locationQuery}
                    setLocationQuery={setLocationQuery}
                    activeDiscipline={activeDiscipline}
                    setActiveDiscipline={(d) => { setActiveDiscipline(d); setCurrentPage(1); }}
                    resultCount={filtered.length}
                />

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                        <FilterToggleButton onClick={() => setSidebarOpen(true)} />
                        <select className="border border-gray-200 rounded-lg text-sm font-medium text-gray-700 py-2 px-3 bg-white">
                            <option>Highest Rated</option>
                            <option>Most Experienced</option>
                            <option>Lowest Price</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
                        <TherapistFilterSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                        <div>
                            <div className="hidden lg:flex justify-end mb-4">
                                <select className="border border-gray-200 rounded-lg text-sm font-medium text-gray-700 py-2 px-4 bg-white">
                                    <option>Highest Rated</option>
                                    <option>Most Experienced</option>
                                    <option>Lowest Price</option>
                                </select>
                            </div>

                            {paginated.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-gray-500">No therapists match your search criteria.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {paginated.map((t, i) => (
                                        <TherapistPublicCard
                                            key={t.id}
                                            therapist={t}
                                            index={i}
                                            onAuthGate={handleAuthGate}
                                        />
                                    ))}
                                </div>
                            )}

                            {totalPages > 1 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-between pt-10 border-t border-gray-100 mt-10"
                                >
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
                                </motion.div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <AuthGateModal
                isOpen={gateOpen}
                onClose={() => setGateOpen(false)}
                trigger={gateTrigger}
                redirectPath="/therapists"
            />
        </>
    );
}
