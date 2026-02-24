"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import useRequestStore from "@/store/requestStore";
import RequestStepper from "./_components/RequestStepper";
import RequestFormFooter from "./_components/RequestFormFooter";
import Step1ServiceDetails from "./_components/Step1ServiceDetails";
import Step2Location from "./_components/Step2Location";
import Step3Review from "./_components/Step3Review";
import { MdArrowBack } from "react-icons/md";

export default function NewRequestPage() {
    const router = useRouter();
    const { currentStep, nextStep, prevStep, reset, getPreferredDateISO, step1, step2 } = useRequestStore();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleNext = () => nextStep();
    const handleBack = () => {
        if (currentStep === 1) {
            router.push("/customer/requests");
        } else {
            prevStep();
        }
    };

    const handleSubmit = async () => {
        setError("");
        setSubmitting(true);
        try {
            await api.post("/requests", {
                serviceType: step1.serviceType,
                description: step1.description,
                preferredDate: getPreferredDateISO(),
                location: step2.address,
                latitude: step2.latitude,
                longitude: step2.longitude,
            })
            reset();
            router.push("/customer/requests");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to create request. Please try again.");
            setSubmitting(false);
        }
    }

    const isStep1Valid =
        step1.serviceType && step1.description.trim().length >= 10 && step1.preferredDate;
    const isStep2Valid =
        step2.address && step2.latitude !== null && step2.longitude !== null;

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark">
                {/* Sticky Header */}
                <header className="bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark sticky top-0 z-10 px-4 sm:px-8 py-4">
                    <div className="max-w-170 mx-auto">
                        <button
                            onClick={() => router.push("/customer/requests")}
                            className="flex items-center gap-1 text-sm text-text-muted dark:text-gray-400 hover:text-primary mb-1 transition-colors"
                        >
                            <MdArrowBack className="text-base" />
                            My Requests
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold text-text-main dark:text-white">
                            Create New Request
                        </h2>
                    </div>
                </header>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-28">
                    <div className="max-w-170 mx-auto space-y-8">
                        <RequestStepper currentStep={currentStep} />

                        {currentStep === 1 && <Step1ServiceDetails />}
                        {currentStep === 2 && <Step2Location />}
                        {currentStep === 3 && (
                            <Step3Review
                                onEditStep={(s) => useRequestStore.getState().goToStep(s)}
                            />
                        )}

                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <RequestFormFooter
                    currentStep={currentStep}
                    onBack={handleBack}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    canNext={
                        currentStep === 1
                            ? isStep1Valid
                            : currentStep === 2
                                ? isStep2Valid
                                : true
                    }
                    submitting={submitting}
                />
            </div>
        </APIProvider>
    )

}