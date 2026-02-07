"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import { therapistRegistrationSchema } from "@/lib/validationSchema";
import { useTherapistRegistration } from "@/hooks/useTherapistRegistration";
import { MdInfo } from "react-icons/md";

const TherapistRegistrationForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(therapistRegistrationSchema),
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const { registerTherapist, isSubmitting, error, success, clearMessages } = useTherapistRegistration();

    const onSubmit = async (data) => {
        await registerTherapist(data);
    };

    return (
        <div className="max-w-160 mx-auto bg-white dark:bg-background-dark rounded-xl shadow-sm border border-border-subtle dark:border-[#2a3038] overflow-hidden">
            {/* Form Header */}
            <div className="p-8 border-b border-border-subtle dark:border-[#2a3038]">
                <h2 className="text-3xl font-black leading-tight tracking-tight dark:text-white">
                    Create your professional profile
                </h2>
                <p className="text-text-muted mt-2">
                    Enter your credentials to start receiving patient requests.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                {/* Success/Error Messages */}
                {success && (
                    <Alert
                        type="success"
                        message={success}
                        onClose={clearMessages}
                    />
                )}
                {error && (
                    <Alert
                        type="error"
                        message={error}
                        onClose={clearMessages}
                    />
                )}

                {/* Info Banner */}
                <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg flex items-start gap-3">
                    <MdInfo className="text-primary mt-1" size={20} />
                    <p className="text-sm text-primary dark:text-primary/90 leading-relaxed">
                        You will be asked to upload your medical license and NPI number in the
                        next step to verify your professional status.
                    </p>
                </div>

                {/* Basic Info Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <Input
                        label="Full Name"
                        placeholder="Dr. Sarah Wilson"
                        error={errors.fullName?.message}
                        {...register("fullName")}
                        required
                    />
                    <Input
                        label="Professional Email"
                        type="email"
                        placeholder="sarah@clinic.com"
                        error={errors.email?.message}
                        {...register("email")}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        error={errors.phone?.message}
                        {...register("phone")}
                        required
                    />

                    <PasswordInput
                        label="Create Password"
                        placeholder="Min. 8 characters"
                        error={errors.password?.message}
                        {...register("password")}
                        required
                    />
                </div>

                <PasswordInput
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                    required
                />

                {/* CTA */}
                <div className="pt-6 space-y-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Create Professional Account
                    </Button>

                    <p className="text-xs text-center text-text-muted">
                        By clicking create account, you agree to our{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </form>
        </div>
    );
};

export default TherapistRegistrationForm;
