"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MdChevronLeft, MdChevronRight, MdList, MdMap } from "react-icons/md";
import FindTherapistsListCard from "./FindTherapistsListCard";
import FindTherapistsMapPanel from "./FindTherapistsMapPanel";

function ListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="bg-card-light  border border-border-light  rounded-xl p-4 animate-pulse"
                >
                    <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted-light " />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-muted-light  rounded" />
                            <div className="h-3 w-20 bg-muted-light  rounded" />
                            <div className="h-3 w-48 bg-muted-light  rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasActiveFilters, onClear }) {
    return (
        <div className="text-center py-16">
            <p className="text-text-muted  text-sm">No therapists match your search.</p>
            <p className="text-xs text-text-muted/70 mt-1">Try adjusting filters or searching a different area.</p>
            {hasActiveFilters && (
                <button
                    onClick={onClear}
                    className="mt-3 text-primary hover:underline text-sm font-bold"
                >
                    Clear all filters
                </button>
            )}
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
            className="flex items-center justify-between pt-4 mt-4 border-t border-border-light "
        >
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 text-sm font-medium text-text-muted  hover:text-primary disabled:opacity-30 transition-colors"
            >
                <MdChevronLeft className="text-lg" />
                Prev
            </button>
            <div className="flex gap-2">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                            currentPage === page
                                ? "bg-primary text-white"
                                : "bg-muted-light  text-text-muted  hover:bg-muted-light/60"
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 text-sm font-medium text-text-muted  hover:text-primary disabled:opacity-30 transition-colors"
            >
                Next
                <MdChevronRight className="text-lg" />
            </button>
        </motion.div>
    );
}

function MobileViewToggle({ view, onChange }) {
    const buttonClass = (key) =>
        `flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
            view === key
                ? "bg-primary text-white shadow-sm"
                : "text-text-muted  hover:text-text-main "
        }`;

    return (
        <div className="lg:hidden bg-muted-light  p-1 rounded-xl flex border border-border-light ">
            <button type="button" onClick={() => onChange("list")} className={buttonClass("list")}>
                <MdList className="text-base" />
                List
            </button>
            <button type="button" onClick={() => onChange("map")} className={buttonClass("map")}>
                <MdMap className="text-base" />
                Map
            </button>
        </div>
    );
}

export default function FindTherapistsResultsLayout({
    therapists,
    mapMarkers = [],
    isLoading,
    isFetching,
    currentPage,
    totalPages,
    onPageChange,
    searchCenter,
    hasActiveFilters,
    onClearFilters,
}) {
    const [hoveredTherapistId, setHoveredTherapistId] = useState(null);
    const [openMarkerId, setOpenMarkerId] = useState(null);
    const [mobileView, setMobileView] = useState("list");
    const cardRefs = useRef({});

    const hoveredIsValid = therapists.some((t) => t.id === hoveredTherapistId);
    const activeHoveredTherapistId = hoveredIsValid ? hoveredTherapistId : null;

    const openMarkerIsValid = mapMarkers.some((m) => m.id === openMarkerId);
    const activeOpenMarkerId = openMarkerIsValid ? openMarkerId : null;

    const highlightedTherapistId = activeHoveredTherapistId;

    const findMarkerForTherapist = (therapistId) =>
        mapMarkers.find((m) => m.therapists.some((t) => t.id === therapistId));

    const handleHoverCard = (therapistId) => {
        setHoveredTherapistId(therapistId);
        if (!therapistId) return;
        const marker = findMarkerForTherapist(therapistId);
        if (activeOpenMarkerId && (!marker || marker.id !== activeOpenMarkerId)) {
            setOpenMarkerId(null);
        }
    };

    const handleSelectCard = (therapistId) => {
        const marker = findMarkerForTherapist(therapistId);
        if (!marker) return;
        if (activeOpenMarkerId === marker.id) return;
        setHoveredTherapistId(therapistId);
        setOpenMarkerId(marker.id);
    };

    const handleMarkerClick = (marker) => {
        setOpenMarkerId(marker.id);
        if (marker.therapists.length === 1) {
            const therapistId = marker.therapists[0].id;
            setHoveredTherapistId(therapistId);
            const el = cardRefs.current[therapistId];
            if (el?.scrollIntoView) {
                el.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }
    };

    const handleCloseInfoWindow = () => {
        setOpenMarkerId(null);
    };

    const showMap = mobileView === "map";
    const showList = mobileView === "list";

    return (
        <section className="flex-1 min-h-0 w-full overflow-hidden">
            <div className="h-full flex flex-col">
                <div className="lg:hidden px-4 py-3 shrink-0">
                    <MobileViewToggle view={mobileView} onChange={setMobileView} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] flex-1 min-h-0">
                    <div
                        className={`flex flex-col bg-muted-light  lg:overflow-hidden ${showMap ? "hidden lg:flex" : "flex"}`}
                    >
                        <div className={`flex-1 min-h-0 lg:overflow-y-auto overscroll-contain panel-scroll px-5 sm:px-7 py-4 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}>
                            {isLoading ? (
                                <ListSkeleton />
                            ) : therapists.length === 0 ? (
                                <EmptyState hasActiveFilters={hasActiveFilters} onClear={onClearFilters} />
                            ) : (
                                <div className="space-y-3">
                                    {therapists.map((t, i) => (
                                        <FindTherapistsListCard
                                            key={t.id}
                                            therapist={t}
                                            index={i}
                                            isHighlighted={highlightedTherapistId === t.id}
                                            onHover={handleHoverCard}
                                            onSelect={handleSelectCard}
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
                        <FindTherapistsMapPanel
                            markers={mapMarkers}
                            highlightedTherapistId={highlightedTherapistId}
                            openMarkerId={activeOpenMarkerId}
                            onMarkerClick={handleMarkerClick}
                            onCloseInfoWindow={handleCloseInfoWindow}
                            searchCenter={searchCenter}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
