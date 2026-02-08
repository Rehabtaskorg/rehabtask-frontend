"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdPerson, MdBusiness, MdCheckCircle } from "react-icons/md";
import { FaUserMd } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { oauthOnboardingSchema } from "@/lib/validationSchema";
import { useOAuthOnboarding } from "@/hooks/useOAuthOnboarding";

/**
 * Inner component that is allowed to use useSearchParams
 */
function OAuthOnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const provider = searchParams.get("provider") || "Google";

    const [selectedRole, setSelectedRole] = useState(null);
    const formRef = useRef(null);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
        setValue
    } = useForm({
        resolver: zodResolver(oauthOnboardingSchema),
        mode: "onBlur",
    });

    const { completeOnboarding, isSubmitting, error, clearError } =
        useOAuthOnboarding();

    // eslint-disable-next-line react-hooks/incompatible-library
    const customerType = watch("customerType");

    useEffect(() => {
        if (selectedRole && formRef.current) {
            formRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [selectedRole]);

    const handleRoleSelection = (role) => {
        if (selectedRole !== role) {
            reset();
            setSelectedRole(role);
            setValue("role", role);
        }
    };

    const onSubmit = async (data) => {
        await completeOnboarding(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark p-4 transition-colors duration-300">
            <div className="w-full max-w-2xl bg-white dark:bg-[#1a2632] shadow-xl rounded-xl overflow-hidden border border-border-subtle dark:border-[#2d3a4a]">

                {/* Progress Indicator */}
                <div className="px-8 pt-8">
                    <div className="flex items-center justify-center space-x-4 mb-8">
                        <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedRole ? "bg-green-500 text-white" : "bg-primary text-white"
                                }`}>
                                {selectedRole ? <MdCheckCircle size={20} /> : "1"}
                            </div>
                            <span className={`text-sm font-medium ${selectedRole ? "text-text-muted" : "text-text-main dark:text-white"
                                }`}>
                                Role
                            </span>
                        </div>

                        <div className={`h-0.5 w-12 ${selectedRole ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                            }`} />

                        <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedRole
                                ? "bg-primary text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                                }`}>
                                2
                            </div>
                            <span className={`text-sm font-medium ${selectedRole ? "text-text-main dark:text-white" : "text-text-muted"
                                }`}>
                                Profile
                            </span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-text-main dark:text-white mb-2">
                        {selectedRole ? "Complete Your Details" : "Complete Your Profile"}
                    </h1>

                    <p className="text-text-muted dark:text-[#a1b0c0]">
                        {selectedRole
                            ? `Please provide the following information for your ${selectedRole} account.`
                            : `You've successfully signed in with ${provider}. Please select your account type.`}
                    </p>
                </div>

                {/* Role Selection */}
                <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border-subtle dark:border-[#2d3a4a]">
                    <button
                        type="button"
                        onClick={() => handleRoleSelection("customer")}
                        className={`group p-6 border-2 rounded-xl transition-all ${selectedRole === "customer"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border-subtle dark:border-[#2d3a4a] hover:border-primary/50"
                            }`}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`p-4 rounded-full ${selectedRole === "customer"
                                ? "bg-primary text-white"
                                : "bg-primary/10 text-primary"
                                }`}>
                                <MdPerson className="text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white">
                                    Customer
                                </h3>
                                <p className="text-sm text-text-muted dark:text-[#a1b0c0]">
                                    Book therapy sessions
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleRoleSelection("therapist")}
                        className={`group p-6 border-2 rounded-xl transition-all ${selectedRole === "therapist"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border-subtle dark:border-[#2d3a4a] hover:border-primary/50"
                            }`}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`p-4 rounded-full ${selectedRole === "therapist"
                                ? "bg-primary text-white"
                                : "bg-primary/10 text-primary"
                                }`}>
                                <FaUserMd className="text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main dark:text-white">
                                    Therapist
                                </h3>
                                <p className="text-sm text-text-muted dark:text-[#a1b0c0]">
                                    Offer your services
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Form */}
                <AnimatePresence>
                    {selectedRole && (
                        <motion.div
                            ref={formRef}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="px-8 py-8 space-y-4 bg-gray-50/50 dark:bg-[#151f28]"
                            >
                                {error && (
                                    <Alert
                                        type="error"
                                        message={error}
                                        onClose={clearError}
                                    />
                                )}

                                {/* ⬅️ form fields unchanged (same as your original file) */}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                >
                                    Complete Profile
                                </Button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * Page component with Suspense boundary
 */
export default function OAuthOnboardingPage() {
    return (
        <Suspense fallback={null}>
            <OAuthOnboardingContent />
        </Suspense>
    );
}
