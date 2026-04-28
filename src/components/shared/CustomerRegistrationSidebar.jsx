import { MdVerifiedUser, MdSpeed, MdSecurity, MdHelpOutline, MdMedicalServices } from "react-icons/md";

const CustomerRegistrationSidebar = () => {
    return (
        <aside className="w-full lg:w-[40%] bg-[#0a1929] p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Decorative background pattern */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle at 2px 2px, #137fec 1px, transparent 0)",
                    backgroundSize: "24px 24px"
                }}
            />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />

            <div className="relative z-10">
                {/* Brand */}
                <div className="flex items-center gap-2 mb-12">
                    <div className="bg-primary p-2 rounded-lg">
                        <MdMedicalServices className="text-white text-2xl" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">RehabTask</span>
                </div>

                {/* Heading */}
                <div className="space-y-6">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                        Find Licensed Care <br />in Minutes
                    </h1>
                    <p className="text-primary/80 text-lg leading-relaxed">
                        All therapists are vetted, licensed, and ready to provide rehabilitation services. Join the community of rehab professionals today.
                    </p>
                </div>

                {/* Features */}
                <div className="mt-12 space-y-5">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-primary/20 p-1 rounded-full">
                            <MdVerifiedUser className="text-primary text-sm" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Verified Professionals</p>
                            <p className="text-zinc-400 text-sm">Rigorous background checks and license verification for all staff.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-primary/20 p-1 rounded-full">
                            <MdSpeed className="text-primary text-sm" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Instant Matching</p>
                            <p className="text-zinc-400 text-sm">Our algorithm finds the best therapist for your specific needs instantly.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="mt-1 bg-primary/20 p-1 rounded-full">
                            <MdSecurity className="text-primary text-sm" />
                        </div>
                        <div>
                            <p className="text-white font-medium">Secure & HIPAA Compliant</p>
                            <p className="text-zinc-400 text-sm">Your data and privacy are protected by industry-leading security.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Link */}
            <div className="relative z-10 pt-8">
                <button className="flex items-center gap-2 text-white/70 hover:text-primary transition-colors text-sm font-medium">
                    <MdHelpOutline className="text-base" />
                    Need assistance? Contact Support
                </button>
            </div>
        </aside>
    );
};

export default CustomerRegistrationSidebar;
