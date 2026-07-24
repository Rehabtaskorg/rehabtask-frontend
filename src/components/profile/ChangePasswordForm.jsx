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
        console.log("Form data before submit:", data);
        const result = await changePassword(data.currentPassword, data.newPassword, data.confirmNewPassword);

        if (result.success) {
            // Reset form on success
            reset();

            // Auto-clear success message after 5 seconds
            setTimeout(() => {
                clearMessages();
            }, 5000);
        }
    };

    return (
        <div className="bg-white  rounded-xl shadow-sm border border-border-light  overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border-light  bg-muted-light ">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MdLock className="text-primary text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-text-main ">
                            Change Password
                        </h2>
                        <p className="text-sm text-text-muted ">
                            Update your password to keep your account secure
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
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
                <div className="bg-blue-50  border border-blue-200  p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                        <MdLock className="text-blue-500 text-lg shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800  space-y-1">
                            <p className="font-semibold">Password Requirements:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-xs">
                                <li>At least 8 characters long</li>
                                <li>Contains uppercase and lowercase letters</li>
                                <li>Contains at least one number</li>
                                <li>Contains at least one special character (@$!%*?&#)</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
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

                {/* Submit Button */}
                <div className="pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
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