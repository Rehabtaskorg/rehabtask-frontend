"use client";

import Header from "@/components/shared/Header";
import RegistrationSidebar from "@/components/shared/RegistrationSidebar";
import Footer from "@/components/shared/Footer";
import TherapistRegistrationForm from "@/components/forms/TherapistRegistrationForm";

export default function TherapistRegisterPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200 dark:text-white">
            {/* Top Navigation */}
            <Header />

            <main className="flex flex-1 flex-col lg:flex-row">
                <RegistrationSidebar />

                {/* Registration Form */}
                <section className="flex-1 overflow-y-auto bg-background-light dark:bg-[#0d141c] p-6 md:p-12">
                    <TherapistRegistrationForm />
                    <Footer />
                </section>
            </main>

        </div>
    )
}