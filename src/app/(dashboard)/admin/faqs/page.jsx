"use client";

import { useState, useMemo } from "react";
import {
    MdAdd,
    MdEdit,
    MdDelete,
    MdClose,
    MdExpandMore,
    MdExpandLess,
    MdSearch,
    MdQuestionAnswer,
    MdWarning,
} from "react-icons/md";
import {
    useAdminFaqs,
    useCreateFaq,
    useUpdateFaq,
    useDeleteFaq,
} from "@/hooks/useAdmin";

function Skeleton({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
        />
    );
}

const EMPTY_FORM = { question: "", answer: "", category: "", order: "" };

function FaqModal({ faq, onClose }) {
    const isEdit = Boolean(faq);
    const createMutation = useCreateFaq();
    const updateMutation = useUpdateFaq();

    const [form, setForm] = useState(
        faq
            ? {
                question: faq.question ?? "",
                answer: faq.answer ?? "",
                category: faq.category ?? "",
                order: faq.sortOrder != null ? String(faq.sortOrder) : "",
            }
            : EMPTY_FORM
    );
    const [error, setError] = useState("");

    const set = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const isPending = createMutation.isPending || updateMutation.isPending;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.question.trim() || !form.answer.trim()) {
            setError("Question and answer are required.");
            return;
        }
        const payload = {
            question: form.question.trim(),
            answer: form.answer.trim(),
            ...(form.category.trim() ? { category: form.category.trim() } : {}),
            ...(form.order.trim() !== "" ? { sortOrder: Number(form.order) } : {}),
        };
        try {
            if (isEdit) {
                await updateMutation.mutateAsync({ id: faq.id, ...payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            onClose();
        } catch (err) {
            setError(err?.response?.data?.message ?? "Something went wrong.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark w-full max-w-lg shadow-xl flex flex-col max-h-[90dvh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark shrink-0">
                    <h2 className="font-semibold text-text-main dark:text-white">
                        {isEdit ? "Edit FAQ" : "New FAQ"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-background-light dark:hover:bg-background-dark text-text-muted"
                    >
                        <MdClose size={18} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-1 overflow-hidden"
                >
                    <div className="flex-1 overflow-y-auto panel-scroll px-5 py-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Question <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={form.question}
                                onChange={set("question")}
                                rows={2}
                                placeholder="What is the question?"
                                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                Answer <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={form.answer}
                                onChange={set("answer")}
                                rows={6}
                                placeholder="Provide a detailed answer…"
                                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={form.category}
                                    onChange={set("category")}
                                    placeholder="e.g. Billing"
                                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main dark:text-white mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={set("order")}
                                    placeholder="0"
                                    min="0"
                                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                                <MdWarning size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-border-light dark:border-border-dark shrink-0 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted text-sm hover:bg-background-light dark:hover:bg-background-dark"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-50"
                        >
                            {isPending
                                ? "Saving…"
                                : isEdit
                                    ? "Save Changes"
                                    : "Create FAQ"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteModal({ faq, onClose }) {
    const deleteMutation = useDeleteFaq();

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(faq.id);
            onClose();
        } catch { }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative bg-card-light dark:bg-card-dark rounded-2xl border border-border-light dark:border-border-dark w-full max-w-sm shadow-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">
                        <MdDelete size={20} />
                    </div>
                    <h2 className="font-semibold text-text-main dark:text-white">Delete FAQ?</h2>
                </div>
                <p className="text-sm text-text-muted mb-1">
                    This will permanently remove:
                </p>
                <p className="text-sm text-text-main dark:text-white font-medium line-clamp-2 mb-5">
                    &quot;{faq.question}&quot;
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-muted text-sm hover:bg-background-light dark:hover:bg-background-dark"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
                    >
                        {deleteMutation.isPending ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FaqItem({ faq, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
            {/* Question row */}
            <div
                className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark transition-colors select-none"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        {faq.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {faq.category}
                            </span>
                        )}
                        {faq.sortOrder != null && (
                            <span className="text-xs text-text-muted">#{faq.sortOrder}</span>
                        )}
                    </div>
                    <p className="text-sm font-medium text-text-main dark:text-white leading-snug">
                        {faq.question}
                    </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(faq);
                        }}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
                        title="Edit"
                    >
                        <MdEdit size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(faq);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <MdDelete size={16} />
                    </button>
                    <span className="text-text-muted ml-1">
                        {expanded ? (
                            <MdExpandLess size={18} />
                        ) : (
                            <MdExpandMore size={18} />
                        )}
                    </span>
                </div>
            </div>

            {/* Answer */}
            {expanded && (
                <div className="px-4 pt-3 pb-4 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark">
                    <p className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed">
                        {faq.answer}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function AdminFaqsPage() {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [deletingFaq, setDeletingFaq] = useState(null);

    const { data, isLoading } = useAdminFaqs();
    const faqs = useMemo(
        () => (Array.isArray(data) ? data : data?.faqs ?? []),
        [data]
    );

    const categories = useMemo(() => {
        const cats = [...new Set(faqs.map((f) => f.category).filter(Boolean))];
        return cats.sort();
    }, [faqs]);

    const filtered = useMemo(() => {
        let list = [...faqs].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
        if (categoryFilter !== "all") {
            list = list.filter((f) => f.category === categoryFilter);
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
    }, [faqs, search, categoryFilter]);

    const openCreate = () => {
        setEditingFaq(null);
        setShowModal(true);
    };
    const openEdit = (faq) => {
        setEditingFaq(faq);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setEditingFaq(null);
    };

    return (
        <div className="flex-1 p-4 lg:p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text-main dark:text-white">FAQ Management</h1>
                    <p className="text-sm text-text-muted mt-0.5">
                        {faqs.length} question{faqs.length !== 1 ? "s" : ""} published
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium"
                >
                    <MdAdd size={18} />
                    Add FAQ
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <MdSearch
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search questions or answers…"
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                {categories.length > 0 && (
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-text-main dark:text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-background-light dark:bg-background-dark mb-3">
                        <MdQuestionAnswer size={32} className="text-text-muted" />
                    </div>
                    <p className="text-sm font-medium text-text-main dark:text-white">No FAQs found</p>
                    <p className="text-xs text-text-muted mt-1">
                        {search || categoryFilter !== "all"
                            ? "Try adjusting your filters."
                            : 'Click "Add FAQ" to create the first one.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((faq) => (
                        <FaqItem
                            key={faq.id}
                            faq={faq}
                            onEdit={openEdit}
                            onDelete={setDeletingFaq}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showModal && <FaqModal faq={editingFaq} onClose={closeModal} />}
            {deletingFaq && (
                <DeleteModal
                    faq={deletingFaq}
                    onClose={() => setDeletingFaq(null)}
                />
            )}
        </div>
    );
}
