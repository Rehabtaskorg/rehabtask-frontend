"use client";

import Header from "@/components/shared/Header";
import RegistrationSidebar from "@/components/shared/RegistrationSidebar";
import Footer from "@/components/shared/Footer";
import TherapistRegistrationForm from "@/components/forms/TherapistRegistrationForm";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function TherapistRegisterPage() {
    usePageTitle("Therapist Registration");
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200 dark:text-white">
            {/* Top Navigation */}
            <Header />

            <main className="flex flex-1 flex-col lg:flex-row">
                <RegistrationSidebar />

                {/* Registration Form */}
                <section className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 md:p-12">
                    <TherapistRegistrationForm />
                    <Footer />
                </section>
            </main>

        </div>
    )
}