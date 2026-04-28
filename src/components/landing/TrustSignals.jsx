import FadeIn from "@/components/ui/FadeIn";
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
                <FadeIn direction="none" className="text-center text-sm font-semibold text-gray-900 mb-8" as="p">
                    Security and trust built into every interaction
                </FadeIn>
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
                    {BADGES.map((badge, i) => (
                        <FadeIn
                            key={badge.label}
                            delay={i * 0.05}
                            duration={0.3}
                            className="flex items-center gap-2 text-gray-500"
                        >
                            <badge.icon className="text-lg text-primary" />
                            <span className="text-sm font-medium">{badge.label}</span>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}
