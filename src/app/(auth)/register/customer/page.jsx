import { Suspense } from "react";
import Header from "@/components/shared/Header";
import CustomerRegistrationSidebar from "@/components/shared/CustomerRegistrationSidebar";
import Footer from "@/components/shared/Footer";
import CustomerRegistrationForm from "@/components/forms/CustomerRegistrationForm";

export default function CustomerRegisterPage() {
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200">
            <Header />
            <main className="flex flex-1 flex-col lg:flex-row">
                <CustomerRegistrationSidebar />
                <section className="flex-1 overflow-y-auto bg-background-light p-6 md:p-16 flex flex-col justify-center">
                    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>}>
                        <CustomerRegistrationForm />
                    </Suspense>
                    <Footer />
                </section>
            </main>
        </div>
    );
}