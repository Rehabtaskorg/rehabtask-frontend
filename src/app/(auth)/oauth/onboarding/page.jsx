"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdPerson, MdBusiness, MdCheckCircle } from "react-icons/md";
import { FaUserMd } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import Input from "@/components/ui/Input";
import PhoneInput from "@/components/ui/PhoneInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { oauthOnboardingSchema } from "@/lib/validators/therapist.schema";
import { useOAuthOnboarding } from "@/hooks/useOAuthOnboarding";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AUTH_REDIRECT_PARAM } from "@/lib/constants";

function OAuthOnboardingContent() {
    usePageTitle("Complete Your Profile");
    const searchParams = useSearchParams();
    const redirectDescriptor = searchParams.get(AUTH_REDIRECT_PARAM);

    const [selectedRole, setSelectedRole] = useState(null);

    const { register, handleSubmit, watch, reset, formState: { errors }, setValue, control } = useForm({
        resolver: zodResolver(oauthOnboardingSchema),
        mode: "onTouched",
        reValidateMode: "onChange",
        defaultValues: {
            role: "",
            fullName: "",
            phone: "",
            smsOptIn: false,
            customerType: "",
            agencyName: "",
        }
    });

    const { completeOnboarding, isSubmitting, error, clearError } = useOAuthOnboarding(redirectDescriptor);

    // eslint-disable-next-line react-hooks/incompatible-library
    const customerType = watch("customerType");

    const handleRoleSelection = (role) => {
        if (selectedRole !== role) {
            const currentPhone = watch("phone");
            const currentSmsOptIn = watch("smsOptIn");
            reset();
            setValue("role", role);
            setValue("phone", currentPhone);
            setValue("smsOptIn", currentSmsOptIn);
            setSelectedRole(role);
        }
    };

    const onSubmit = async (data) => {
        await completeOnboarding(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50  p-4 transition-colors duration-300">
            <div className="w-full max-w-2xl bg-white  shadow-xl rounded-xl overflow-hidden border border-border-subtle ">

                {/* Progress Indicator */}
                <div className="px-8 pt-8">
                    <div className="flex items-center justify-center space-x-4 mb-8">
                        <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedRole ? "bg-green-500 text-white" : "bg-primary text-white"}`}>
                                {selectedRole ? <MdCheckCircle size={20} /> : "1"}
                            </div>
                            <span className={`text-sm font-medium ${selectedRole ? "text-text-muted" : "text-text-main "}`}>Role</span>
                        </div>
                        <div className={`h-0.5 w-12 ${selectedRole ? "bg-green-500" : "bg-gray-200 "}`} />
                        <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${selectedRole ? "bg-primary text-white" : "bg-gray-200  text-gray-500"}`}>
                                2
                            </div>
                            <span className={`text-sm font-medium ${selectedRole ? "text-text-main " : "text-text-muted"}`}>Profile</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-text-main  mb-2">
                        {selectedRole ? "Complete Your Details" : "Complete Your Profile"}
                    </h1>
                    <p className="text-text-muted ">
                        {selectedRole
                            ? `Please provide the following information for your ${selectedRole} account.`
                            : "To get started, please select your account type below."}
                    </p>
                </div>

                {/* Step 1: Role Selection */}
                <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-border-subtle ">
                    <button
                        type="button"
                        onClick={() => handleRoleSelection("customer")}
                        className={`group relative p-6 border-2 rounded-xl transition-all text-left ${selectedRole === "customer"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border-subtle  hover:border-primary/50"
                            }`}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`p-4 rounded-full transition-colors ${selectedRole === "customer" ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                                <MdPerson className="text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main  mb-1">Customer</h3>
                                <p className="text-sm text-text-muted ">Book therapy sessions</p>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleRoleSelection("therapist")}
                        className={`group relative p-6 border-2 rounded-xl transition-all text-left ${selectedRole === "therapist"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-border-subtle  hover:border-primary/50"
                            }`}
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`p-4 rounded-full transition-colors ${selectedRole === "therapist" ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                                <FaUserMd className="text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-main  mb-1">Therapist</h3>
                                <p className="text-sm text-text-muted ">Offer your services</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Step 2: Animated Form Details */}
                <AnimatePresence mode="wait">
                    {selectedRole && (
                        <motion.div
                            key={selectedRole}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="px-8 py-8 space-y-4 bg-gray-50/50 "
                            >
                                {error && <Alert type="error" message={error} onClose={clearError} />}

                                <Input
                                    label="Full Name"
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    error={errors.fullName?.message}
                                    {...register("fullName")}
                                    required
                                />

                                <PhoneInput
                                    label="Phone Number"
                                    name="phone"
                                    control={control}
                                    error={errors.phone?.message}
                                    required
                                />

                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="smsOptIn"
                                        {...register("smsOptIn")}
                                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="smsOptIn" className="text-sm text-text-muted leading-snug">
                                        By checking this box, you agree to receive SMS appointment reminders and
                                        notifications from RehabTask. Message and data rates may apply.
                                        Reply STOP to opt out at any time.
                                    </label>
                                </div>

                                {selectedRole === "customer" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-text-main  mb-2">
                                                Account Type <span className="text-red-500">*</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <label className="relative cursor-pointer">
                                                    <input type="radio" value="individual" {...register("customerType")} className="peer sr-only" />
                                                    <div className="flex items-center gap-2 p-4 border-2 border-border-subtle  rounded-lg peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                                                        <MdPerson className="text-xl text-text-muted peer-checked:text-primary" />
                                                        <span className="font-semibold text-text-main ">Individual</span>
                                                    </div>
                                                </label>
                                                <label className="relative cursor-pointer">
                                                    <input type="radio" value="agency" {...register("customerType")} className="peer sr-only" />
                                                    <div className="flex items-center gap-2 p-4 border-2 border-border-subtle  rounded-lg peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                                                        <MdBusiness className="text-xl text-text-muted peer-checked:text-primary" />
                                                        <span className="font-semibold text-text-main ">Agency</span>
                                                    </div>
                                                </label>
                                            </div>
                                            {errors.customerType && <p className="mt-1 text-sm text-red-500">{errors.customerType.message}</p>}
                                        </div>
                                        {customerType === "agency" && (
                                            <Input
                                                label="Agency Name"
                                                type="text"
                                                placeholder="e.g. ABC Healthcare Agency"
                                                error={errors.agencyName?.message}
                                                {...register("agencyName")}
                                                required
                                            />
                                        )}
                                    </>
                                )}

                                {selectedRole === "therapist" && (
                                    <>
                                        <Alert
                                            type="info"
                                            message="Your therapist account will be reviewed by our admin team before approval."
                                        />
                                    </>
                                )}

                                <div className="pt-4">
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
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRole(null)}
                                        className="w-full mt-3 text-sm text-text-muted hover:text-primary transition-colors text-center font-medium"
                                    >
                                        Go Back to Role Selection
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function OAuthOnboardingPage() {
    return (
        <Suspense fallback={null}>
            <OAuthOnboardingContent />
        </Suspense>
    );
}
