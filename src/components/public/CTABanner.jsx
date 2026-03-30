"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTABanner() {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-7xl mx-auto relative rounded-2xl overflow-hidden min-h-75 flex items-center justify-center"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&h=600&fit=crop)" }}
                />
                <div className="absolute inset-0 bg-gray-900/70" />
                <div className="relative text-center px-6 py-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to start your recovery</h2>
                    <p className="mt-3 text-gray-300 max-w-lg mx-auto">
                        Browse verified therapists and book your first session today
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/register/customer"
                            className="px-7 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-[#137fec]/20"
                        >
                            Find therapist
                        </Link>
                        <Link
                            href="/register/therapist"
                            className="px-7 py-3 text-sm font-semibold text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Learn more
                        </Link>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
