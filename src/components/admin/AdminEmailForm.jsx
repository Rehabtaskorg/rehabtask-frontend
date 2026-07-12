"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdSend, MdCheckCircle, MdWarning } from "react-icons/md";
import { useSendAdminEmail } from "@/hooks/useAdmin";
import { adminEmailSchema } from "@/lib/validationSchema";
import { AdminRecipientField } from "@/components/admin/AdminRecipientField";

const DEFAULT_VALUES = { to: "", subject: "", message: "" };

/**
 * Self-contained form for admin to send a transactional email to any address.
 * Works for DB users and arbitrary external addresses (e.g. migrated legacy users).
 */
export function AdminEmailForm() {
    const sendEmail = useSendAdminEmail();

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(adminEmailSchema),
        defaultValues: DEFAULT_VALUES,
    });

    const messageLength = watch("message")?.length ?? 0;
    const subjectLength = watch("subject")?.length ?? 0;

    const onSubmit = async (data) => {
        try {
            await sendEmail.mutateAsync(data);
            reset(DEFAULT_VALUES);
        } catch {
        }
    };

    return (
        <div className="max-w-xl">
            <div className="bg-card-light rounded-xl border border-border-light p-6 space-y-5">
                <div>
                    <h3 className="font-semibold text-text-main">Send Direct Email</h3>
                    <p className="text-sm text-text-muted mt-0.5">
                        Send a transactional email to any address — existing users or external recipients.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">
                            Recipient <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="to"
                            control={control}
                            render={({ field }) => (
                                <AdminRecipientField
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.to}
                                />
                            )}
                        />
                        {errors.to && !errors.to.message && (
                            <p className="text-xs text-red-500 mt-1">{errors.to.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Email subject"
                            maxLength={200}
                            className={`w-full rounded-lg border ${errors.subject ? "border-red-400" : "border-border-light"} bg-background-light text-text-main text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary`}
                            {...register("subject")}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.subject ? (
                                <p className="text-xs text-red-500">{errors.subject.message}</p>
                            ) : (
                                <span />
                            )}
                            <p className="text-xs text-text-muted">{subjectLength}/200</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={6}
                            placeholder="Write your message…"
                            maxLength={5000}
                            className={`w-full rounded-lg border ${errors.message ? "border-red-400" : "border-border-light"} bg-background-light text-text-main text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary`}
                            {...register("message")}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.message ? (
                                <p className="text-xs text-red-500">{errors.message.message}</p>
                            ) : (
                                <span />
                            )}
                            <p className="text-xs text-text-muted">{messageLength}/5000</p>
                        </div>
                    </div>

                    {sendEmail.isError && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                            <MdWarning size={16} />
                            {sendEmail.error?.response?.data?.message ?? "Failed to send email. Please try again."}
                        </div>
                    )}

                    {sendEmail.isSuccess && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <MdCheckCircle size={16} />
                            Email sent successfully.
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || sendEmail.isPending}
                        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <MdSend size={16} />
                        {sendEmail.isPending ? "Sending…" : "Send Email"}
                    </button>
                </form>
            </div>
        </div>
    );
}
