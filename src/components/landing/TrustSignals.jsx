"use client";

import { motion } from "framer-motion";
import { MdShield, MdVerified, MdLock, MdHealthAndSafety, MdGppGood, MdSecurity } from "react-icons/md";

const BADGES = [
    { icon: MdShield, label: "HIPAA Compliant" },
    { icon: MdVerified, label: "Background Checked" },
    { icon: MdHealthAndSafety, label: "Licensed Professionals" },
    { icon: MdLock, label: "Secure Payments" },
    { icon: MdSecurity, label: "Data Encrypted" },
    { icon: MdGppGood, label: "SOC 2 Ready" },
];

export default function TrustSignals() {
    return (
        <section className="py-12 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center text-sm font-semibold text-gray-900 mb-8"
                >
                    Security and trust built into every interaction
                </motion.p>
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                    {BADGES.map((badge, i) => (
                        <motion.div
                            key={badge.label}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="flex items-center gap-2 text-gray-500"
                        >
                            <badge.icon className="text-lg text-primary" />
                            <span className="text-sm font-medium">{badge.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
