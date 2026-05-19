"use client";

import { useState, useMemo } from "react";
import {
    MdExpandMore,
    MdExpandLess,
    MdSearch,
    MdQuestionAnswer,
    MdRefresh,
} from "react-icons/md";
import { usePublicFaqs } from "@/hooks/useFaqs";
import { usePageTitle } from "@/hooks/usePageTitle";

function FaqItem({ faq, expanded, onToggle }) {
    return (
        <div className="border border-border-light  rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50  transition-colors"
            >
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main  leading-snug">
                        {faq.question}
                    </p>
                </div>
                <span className="text-text-muted shrink-0 mt-0.5">
                    {expanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                </span>
            </button>
            {expanded && (
                <div className="px-4 pt-3 pb-4 border-t border-border-light  bg-slate-50 ">
                    <p className="text-sm text-text-muted  whitespace-pre-wrap leading-relaxed">
                        {faq.answer}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function CustomerFaqsPage() {
    usePageTitle("FAQs");
    const { faqs, loading, error, refetch } = usePublicFaqs();
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [expandedId, setExpandedId] = useState(null);

    const categories = useMemo(() => {
        const cats = [...new Set(faqs.map((f) => f.category).filter(Boolean))];
        return cats.sort();
    }, [faqs]);

    const filtered = useMemo(() => {
        let list = [...faqs].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
        if (activeCategory !== "all") {
            list = list.filter((f) => f.category === activeCategory);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (f) =>
                    f.question.toLowerCase().includes(q) ||
                    f.answer.toLowerCase().includes(q)
            );
        }
        return list;
    }, [faqs, search, activeCategory]);

    const grouped = useMemo(() => {
        if (activeCategory !== "all") return null;
        const map = new Map();
        for (const faq of filtered) {
            const cat = faq.category || "General";
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat).push(faq);
        }
        return map;
    }, [filtered, activeCategory]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center px-4 sm:px-8 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
                        Frequently Asked Questions
                    </h2>
                </header>
                <div className="p-4 sm:p-8 space-y-3 max-w-3xl mx-auto w-full">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-14 bg-card-light  border border-border-light  rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center px-4 sm:px-8 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
                        Frequently Asked Questions
                    </h2>
                </header>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <p className="text-text-muted  text-sm">Failed to load FAQs.</p>
                        <button onClick={refetch} className="text-primary hover:underline text-sm font-bold flex items-center gap-1 mx-auto">
                            <MdRefresh className="text-base" /> Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-slate-200  bg-white/80  backdrop-blur-md sticky top-14 lg:top-0 z-10 flex items-center px-4 sm:px-8 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main ">
                    Frequently Asked Questions
                </h2>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-5">

                    {/* Search */}
                    <div className="relative">
                        <MdSearch
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search questions..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-light  bg-card-light  text-text-main  text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                    </div>

                    {/* Category Tabs */}
                    {categories.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setActiveCategory("all")}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === "all"
                                    ? "bg-primary text-white"
                                    : "bg-slate-100  text-slate-600  hover:bg-slate-200 "
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat
                                        ? "bg-primary text-white"
                                        : "bg-slate-100  text-slate-600  hover:bg-slate-200 "
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* FAQ List */}
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 rounded-full bg-slate-100  mb-3">
                                <MdQuestionAnswer size={32} className="text-slate-300 " />
                            </div>
                            <p className="text-sm font-medium text-text-main ">No FAQs found</p>
                            <p className="text-xs text-text-muted  mt-1">
                                {search || activeCategory !== "all"
                                    ? "Try adjusting your search or filter."
                                    : "No questions have been published yet."}
                            </p>
                        </div>
                    ) : grouped ? (
                        /* Grouped by category */
                        Array.from(grouped.entries()).map(([category, items]) => (
                            <div key={category}>
                                <h3 className="text-xs font-semibold text-text-muted  uppercase tracking-wide mb-3">
                                    {category}
                                </h3>
                                <div className="space-y-2">
                                    {items.map((faq) => (
                                        <FaqItem
                                            key={faq.id}
                                            faq={faq}
                                            expanded={expandedId === faq.id}
                                            onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Flat list (filtered by category) */
                        <div className="space-y-2">
                            {filtered.map((faq) => (
                                <FaqItem
                                    key={faq.id}
                                    faq={faq}
                                    expanded={expandedId === faq.id}
                                    onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
