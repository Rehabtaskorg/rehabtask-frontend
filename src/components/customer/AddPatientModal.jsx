"use client";

import { useState } from "react";
import { MdClose, MdPerson, MdEmail } from "react-icons/md";
import { useCreatePatient } from "@/hooks/usePatients";

export default function AddPatientModal({ isOpen, onClose, onSuccess }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState({});
    const createPatient = useCreatePatient();

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = "Full name is required";
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";
        if (phone.trim() && !/^\+1\d{10}$/.test(phone.trim())) {
            newErrors.phone = "Phone must be in format +1XXXXXXXXXX";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await createPatient.mutateAsync({
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
            });
            setFullName("");
            setEmail("");
            setPhone("");
            setErrors({});
            onSuccess?.();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to add patient.";
            setErrors({ form: msg });
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    }

    const inputClass = (hasError) =>
        `w-full pl-10 pr-3 py-2.5 rounded-lg border ${hasError ? "border-red-400 dark:border-red-600" :
            "border-border-light dark:border-border-dark"} bg-background-light dark:bg-background-dark text-text-main
             dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all`;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-card-light dark:bg-card-dark rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-text-main dark:text-white">Add New Patient</h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white transition-colors p-1"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.form && (
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {errors.form}
                        </div>
                    )}

                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-white mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-400 text-lg" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter patient full name"
                                className={inputClass(errors.fullName)}
                            />
                        </div>
                        {errors.fullName && (
                            <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-white mb-1.5">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-gray-400 text-lg" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. patient@example.com"
                                className={inputClass(errors.email)}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-text-main dark:text-white mb-1.5">
                            Phone Number <span className="text-text-muted dark:text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div className={`flex items-center rounded-lg border overflow-hidden ${errors.phone ? "border-red-400 dark:border-red-600" : "border-border-light dark:border-border-dark"} bg-background-light dark:bg-background-dark`}>
                            <span className="px-3 py-2.5 text-sm text-text-muted dark:text-gray-400 border-r border-border-light dark:border-border-dark select-none bg-slate-50 dark:bg-slate-800 shrink-0">
                                +1
                            </span>
                            <input
                                type="tel"
                                value={phone.startsWith("+1") ? phone.slice(2) : phone}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                    setPhone(digits ? `+1${digits}` : "");
                                }}
                                maxLength={10}
                                placeholder="2025550123"
                                className="flex-1 px-3 py-2.5 bg-transparent text-text-main dark:text-white text-sm focus:outline-none placeholder:text-text-muted/50"
                            />
                        </div>
                        {errors.phone ? (
                            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                        ) : (
                            <p className="mt-1.5 text-xs text-text-muted dark:text-gray-400">
                                Optional — enter the 10-digit US number
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-text-muted dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createPatient.isPending}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createPatient.isPending ? "Adding..." : "Add Patient"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )

}