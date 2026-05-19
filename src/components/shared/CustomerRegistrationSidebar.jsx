import { MdVerifiedUser, MdSpeed, MdSecurity, MdLock } from "react-icons/md";

const BENEFITS = [
    {
        icon: MdVerifiedUser,
        title: "Verified Professionals",
        description: "Rigorous background checks and license verification for all therapists.",
    },
    {
        icon: MdSpeed,
        title: "Instant Matching",
        description: "Find the right therapist for your specific needs in minutes.",
    },
    {
        icon: MdSecurity,
        title: "Secure & HIPAA Compliant",
        description: "Your data and privacy are protected by industry-leading security.",
    },
];

const CustomerRegistrationSidebar = () => {
    return (
        <aside className="w-full lg:w-100 bg-white  border-r border-border-subtle  p-8 lg:p-12 flex flex-col justify-between">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                    <div className="bg-primary/10 rounded-xl p-4 w-fit">
                        <MdVerifiedUser className="text-primary text-4xl" />
                    </div>
                    <h1 className="text-2xl font-bold leading-tight ">
                        Find Licensed Care in Minutes
                    </h1>
                    <p className="text-text-muted text-base">
                        All therapists are vetted, licensed, and ready to provide rehabilitation services near you.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    {BENEFITS.map((benefit) => {
                        const Icon = benefit.icon;
                        return (
                            <div key={benefit.title} className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background-light  text-primary">
                                    <Icon className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base ">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm text-text-muted">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border-subtle ">
                <div className="flex items-center gap-3 text-text-muted">
                    <MdLock className="text-green-500 text-lg" />
                    <p className="text-xs font-medium uppercase tracking-wider">
                        HIPAA Compliant &amp; Secure
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default CustomerRegistrationSidebar;
