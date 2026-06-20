"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MdClose } from "react-icons/md";

/** Within this many pixels of the bottom counts as "reached the end". */
const SCROLL_BOTTOM_THRESHOLD_PX = 24;

/**
 * Read-only modal for displaying a long legal document. Tracks whether the
 * reader has scrolled to the bottom at least once and reports it via
 * onScrolledToBottom, so the calling form can gate its agreement checkbox
 * on the document actually having been read, not just the modal opened.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title: string,
 *   content: string,
 *   onScrolledToBottom?: () => void,
 * }} props
 */
export function DocumentReaderModal({ isOpen, onClose, title, content, onScrolledToBottom }) {
    const contentRef = useRef(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
        if (isOpen) window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) setScrollProgress(0);
    }, [isOpen]);

    const handleScroll = () => {
        const el = contentRef.current;
        if (!el) return;

        const maxScroll = el.scrollHeight - el.clientHeight;
        const progress = maxScroll <= 0 ? 100 : Math.min(100, (el.scrollTop / maxScroll) * 100);
        setScrollProgress(progress);

        if (maxScroll <= 0 || el.scrollTop >= maxScroll - SCROLL_BOTTOM_THRESHOLD_PX) {
            onScrolledToBottom?.();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.25 }}
                        className="relative bg-card-light rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light shrink-0">
                            <h2 className="text-lg font-bold text-text-main">{title}</h2>
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-slate-100 transition-colors"
                            >
                                <MdClose className="text-xl" />
                            </button>
                        </div>

                        <div className="h-1 bg-border-light shrink-0">
                            <div
                                className="h-full bg-primary transition-all duration-150"
                                style={{ width: `${scrollProgress}%` }}
                            />
                        </div>

                        <div
                            ref={contentRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto px-6 py-5"
                        >
                            <p className="text-text-main text-sm whitespace-pre-wrap leading-relaxed">
                                {content}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}