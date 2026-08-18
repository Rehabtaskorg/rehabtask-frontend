import { Suspense } from "react";
import Header from "@/components/shared/Header";
import RegistrationSidebar from "@/components/shared/RegistrationSidebar";
import Footer from "@/components/shared/Footer";
import TherapistRegistrationForm from "@/components/forms/TherapistRegistrationForm";

export default function TherapistRegisterPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <Header />
            <main className="flex flex-1 flex-col lg:flex-row">
                <RegistrationSidebar />
                <section className="flex-1 overflow-y-auto bg-background-light p-6 md:p-12">
                    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>}>
                        <TherapistRegistrationForm />
                    </Suspense>
                    <Footer />
                </section>
            </main>
        </div>
    );
}