"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdArrowBack, MdArrowForward, MdLockReset, MdVerifiedUser } from "react-icons/md";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Alert from "../ui/Alert";
import Link from "next/link";
import { forgotPasswordSchema } from "@/lib/validationSchema";
import { usePasswordReset } from "@/hooks/usePasswordReset";

const ForgotPasswordForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const { requestPasswordReset, isSubmitting, error, success, clearMessages } = usePasswordReset();

    const onSubmit = async (data) => {
        await requestPasswordReset(data.email);
    }

    return (
        <div className="flex flex-col max-w-120 w-full bg-white  shadow-xl rounded-xl overflow-hidden border border-border-subtle ">
            <div className="w-full bg-primary/5  aspect-21/9 flex items-center justify-center">
                <MdLockReset className="text-primary text-6xl" />
            </div>

            <div className="p-8 flex flex-col gap-6">
                {/* Headline Section */}
                <div className="text-center">
                    <h1 className="text-text-main  tracking-tight text-3xl font-bold leading-tight">
                        Forgot Your Password?
                    </h1>
                    <p className="text-text-muted  text-base font-normal leading-normal pt-3">
                        No worries! Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                {/* Alert Messages */}
                {error && (
                    <Alert type="error" message={error} onClose={clearMessages} />
                )}

                {success && (
                    <Alert type="success" message={success} onClose={clearMessages} />
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@hospital.com"
                        error={errors.email?.message}
                        {...register("email")}
                        required
                    />

                    {/* Primary Action Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="group h-14"
                    >
                        <span>Send Reset Link</span>
                        <MdArrowForward className="text-lg group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                {/* Secondary navigation */}
                <div className="flex flex-col items-center gap-4 pt-2">
                    <Link
                        href="/login"
                        className="text-primary font-semibold text-sm hover:underline flex items-center gap-1 group"
                    >
                        <MdArrowBack className="text-sm group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </div>
            </div>

            {/* Trust Footer Inside Card */}
            <div className="px-8 py-4 bg-[#f8fafc]  border-t border-border-subtle  flex items-center justify-center gap-2">
                <MdVerifiedUser className="text-text-muted text-sm" />
                <span className="text-text-muted text-xs font-medium">
                    Secure verification process for therapists and patients.
                </span>
            </div>
        </div>
    )

}

export default ForgotPasswordForm