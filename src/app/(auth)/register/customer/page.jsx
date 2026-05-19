"use client";

import Header from "@/components/shared/Header";
import CustomerRegistrationSidebar from "@/components/shared/CustomerRegistrationSidebar";
import Footer from "@/components/shared/Footer";
import CustomerRegistrationForm from "@/components/forms/CustomerRegistrationForm";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function CustomerRegisterPage() {
    usePageTitle("Create Account");
    return (
        <div className="flex min-h-screen flex-col transition-colors duration-200 ">
            <Header />

            <main className="flex flex-1 flex-col lg:flex-row">
                <CustomerRegistrationSidebar />
                <section className="flex-1 overflow-y-auto bg-background-light  p-6 md:p-16 flex flex-col justify-center">
                    <CustomerRegistrationForm />
                    <Footer />
                </section>

            </main>

        </div>
    )
}