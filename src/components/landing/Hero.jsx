"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MdBusiness, MdMedicalServices, MdArrowForward } from "react-icons/md";

export default function Hero() {
    return (
        <section className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-[52px] font-extrabold text-gray-900 leading-tight tracking-tight">
                            Where agencies and therapists connect
                        </h1>
                        <p className="mt-5 text-lg text-gray-600 max-w-lg leading-relaxed">
                            The platform that matches licensed PTs, OTs, and SLPs with home health agencies that need their expertise. Post requests, send offers, and manage care — all in one place.
                        </p>

                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/therapists" className="group">
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#137fec]/30 hover:shadow-lg transition-all h-full"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-[#137fec]/10 flex items-center justify-center mb-3">
                                        <MdBusiness className="text-[#137fec] text-xl" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">I&apos;m a Home Health Agency</p>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                        Post therapy requests and connect with verified therapists in your area.
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#137fec] group-hover:gap-2 transition-all">
                                        Find Therapists <MdArrowForward className="text-sm" />
                                    </span>
                                </motion.div>
                            </Link>

                            <Link href="/requests" className="group">
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-lg transition-all h-full"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
                                        <MdMedicalServices className="text-emerald-600 text-xl" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mb-1">I&apos;m a Licensed Therapist</p>
                                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                                        Set your own rates, choose your clients, and get paid securely for every session.
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                                        Browse Requests <MdArrowForward className="text-sm" />
                                    </span>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop"
                                alt="Physical therapist helping a patient with rehabilitation exercises"
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover"
                                priority
                            />
                        </div>
                        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#137fec]/10 rounded-full blur-2xl" />
                        <div className="absolute -top-4 -right-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
