import { MdMedicalServices, MdCalendarToday, MdVerifiedUser, MdGroup, MdLock } from "react-icons/md"

const RegistrationSidebar = () => {
    const benefits = [
        {
            icon: MdCalendarToday,
            title: "Flexible Scheduling",
            description: "Set your own availability and manage appointments seamlessly.",
        },
        {
            icon: MdVerifiedUser,
            title: "Secure Payments",
            description: "Guaranteed and transparent billing with automated transfers.",
        },
        {
            icon: MdGroup,
            title: "Patient Matching",
            description: "Get connected with patients who specifically need your expertise.",
        },
    ];

    return (
        <aside className="w-full lg:w-100 bg-white  border-r border-border-subtle  p-8 lg:p-12 flex flex-col justify-between">            <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <div className="bg-primary/10 rounded-xl p-4 w-fit">
                    <MdMedicalServices className="text-primary text-4xl" />
                </div>
                <h1 className="text-2xl font-bold leading-tight ">
                    Join the RehabTask Network
                </h1>
                <p className="text-text-muted text-base">
                    Grow your professional practice with our secure healthcare marketplace
                    designed for modern therapy.
                </p>
            </div>

            <div className="flex flex-col gap-6">
                {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                        <div key={index} className="flex gap-4">
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

export default RegistrationSidebar;
