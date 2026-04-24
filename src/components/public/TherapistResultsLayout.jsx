"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import TherapistListCard from "./TherapistListCard";
import TherapistMapPanel from "./TherapistMapPanel";
import MobileViewToggle from "./MobileViewToggle";

function ListSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="bg-card-light border border-border-light rounded-xl p-5 animate-pulse"
                >
                    <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-full bg-muted-light" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-muted-light rounded" />
                            <div className="h-3 w-20 bg-muted-light rounded" />
                            <div className="h-3 w-48 bg-muted-light rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16">
            <p className="text-text-muted text-sm">No therapists match your search.</p>
            <p className="text-xs text-text-muted/70 mt-1">Try adjusting filters or searching a different area.</p>
        </div>
    );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between pt-4 mt-4 border-t border-border-light"
        >
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
            >
                <MdChevronLeft className="text-lg" />
                Previous
            </button>
            <div className="flex gap-2">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                            currentPage === page
                                ? "bg-primary text-white"
                                : "bg-muted-light text-text-muted hover:bg-muted-light/60"
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
            >
                Next
                <MdChevronRight className="text-lg" />
            </button>
        </motion.div>
    );
}

export default function TherapistResultsLayout({
    therapists,
    isLoading,
    isFetching,
    sortBy,
    onSortChange,
    currentPage,
    totalPages,
    onPageChange,
    onAuthGate,
    searchCenter,
}) {
    const [hoveredId, setHoveredId] = useState(null);
    const [openInfoWindowId, setOpenInfoWindowId] = useState(null);
    const [mobileView, setMobileView] = useState("list");
    const cardRefs = useRef({});

    const hoveredIsValid = therapists.some((t) => t.id === hoveredId);
    const activeHoveredId = hoveredIsValid ? hoveredId : null;

    const infoWindowIsValid = therapists.some((t) => t.id === openInfoWindowId);
    const activeInfoWindowId = infoWindowIsValid ? openInfoWindowId : null;

    const highlightedId = activeInfoWindowId || activeHoveredId;

    const handleHoverCard = (id) => {
        setHoveredId(id);
        if (id && openInfoWindowId && openInfoWindowId !== id) {
            setOpenInfoWindowId(null);
        }
    };

    const handleClickPin = (id) => {
        setHoveredId(id);
        setOpenInfoWindowId(id);
        const el = cardRefs.current[id];
        if (el?.scrollIntoView) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    };

    const handleCloseInfoWindow = () => {
        setOpenInfoWindowId(null);
    };

    const showMap = mobileView === "map";
    const showList = mobileView === "list";

    return (
        <section className="flex-1 min-h-0 w-full overflow-hidden">
            <div className="h-full flex flex-col">
                <div className="lg:hidden px-4 py-3 shrink-0">
                    <MobileViewToggle view={mobileView} onChange={setMobileView} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] flex-1 min-h-0">
                    <div
                        className={`flex flex-col bg-gray-50 lg:overflow-hidden ${showMap ? "hidden lg:flex" : "flex"}`}
                    >
                        <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-2">
                            <span className="text-xs text-text-muted">
                                Sorted by{" "}
                                <select
                                    value={sortBy}
                                    onChange={(e) => onSortChange(e.target.value)}
                                    className="text-primary font-semibold bg-transparent border-0 focus:ring-0 cursor-pointer"
                                >
                                    <option value="rating">Highest Rated</option>
                                    <option value="experience">Most Experienced</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </span>
                        </div>

                        <div className={`flex-1 min-h-0 lg:overflow-y-auto overscroll-contain panel-scroll px-4 sm:px-5 pb-4 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}>
                            {isLoading ? (
                                <ListSkeleton />
                            ) : therapists.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <div className="space-y-3">
                                    {therapists.map((t, i) => (
                                        <TherapistListCard
                                            key={t.id}
                                            therapist={t}
                                            index={i}
                                            isHighlighted={highlightedId === t.id}
                                            onHover={handleHoverCard}
                                            onAuthGate={onAuthGate}
                                            cardRef={(el) => (cardRefs.current[t.id] = el)}
                                        />
                                    ))}
                                </div>
                            )}

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={onPageChange}
                            />
                        </div>
                    </div>

                    <div className={`min-h-105 lg:min-h-0 ${showList ? "hidden lg:block" : "block"}`}>
                        <TherapistMapPanel
                            therapists={therapists}
                            highlightedTherapistId={highlightedId}
                            openInfoWindowId={activeInfoWindowId}
                            onPinClick={handleClickPin}
                            onCloseInfoWindow={handleCloseInfoWindow}
                            onAuthGate={onAuthGate}
                            searchCenter={searchCenter}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
