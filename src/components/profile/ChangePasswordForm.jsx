"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdLock } from "react-icons/md";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { changePasswordSchema } from "@/lib/validators/therapist.schema";
import { useChangePassword } from "@/hooks/useChangePassword";

const ChangePasswordForm = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: ""
        }
    });

    const { changePassword, isSubmitting, error, success, clearMessages } = useChangePassword();

    const onSubmit = async (data) => {
        const result = await changePassword(data.currentPassword, data.newPassword, data.confirmNewPassword);

        if (result.success) {
            reset();

            setTimeout(() => {
                clearMessages();
            }, 5000);
        }
    };

    return (
        <div className="rounded-xl border border-border-light bg-card-light p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                    <MdLock className="text-xl text-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-main">
                        Change Password
                    </h3>
                    <p className="text-sm text-text-muted">
                        Update your password to keep your account secure
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <Alert
                    type="info"
                    message="Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&#)."
                />

                <PasswordInput
                    label="Current Password"
                    placeholder="Enter your current password"
                    error={errors.currentPassword?.message}
                    {...register("currentPassword")}
                    required
                />

                <PasswordInput
                    label="New Password"
                    placeholder="Enter your new password"
                    error={errors.newPassword?.message}
                    {...register("newPassword")}
                    required
                />

                <PasswordInput
                    label="Confirm New Password"
                    placeholder="Re-enter your new password"
                    error={errors.confirmNewPassword?.message}
                    {...register("confirmNewPassword")}
                    required
                />

                <div className="flex justify-end pt-1">
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full sm:w-auto"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        Update Password
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordForm;