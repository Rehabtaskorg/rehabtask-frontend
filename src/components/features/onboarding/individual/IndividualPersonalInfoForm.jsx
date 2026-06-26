"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import { IndividualOnboardingProgressBar } from "@/components/features/onboarding/individual/IndividualOnboardingProgressBar";
import { useIndividualPersonalInfoForm } from "@/hooks/useIndividualPersonalInfoForm";
import { usePageTitle } from "@/hooks/usePageTitle";
import { US_STATES } from "@/lib/constants/credentials";
import { useRouter } from "next/navigation";

/**
 * Individual onboarding Step 2 — Personal Information.
 * Renders a spinner until backend data is ready, then mounts the form
 * with correct defaultValues so all fields are pre-filled on load.
 */
export function IndividualPersonalInfoForm() {
    usePageTitle("Personal Information");
    const form = useIndividualPersonalInfoForm();

    if (!form.ready) {
        return (
            <div className="min-h-screen bg-background-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <IndividualPersonalInfoFormInner {...form} />
        </APIProvider>
    );
}

/**
 * @param {{ register: Function, handleSubmit: Function, errors: object, setValue: Function, addressLine1Display: string, setAddressLine1Display: Function, handleAddressSelect: Function, handleAddressClear: Function, registration: object, loading: boolean, submitError: string|null, onSubmit: Function }} props
 */
function IndividualPersonalInfoFormInner({
    register,
    handleSubmit,
    errors,
    addressLine1Display,
    setAddressLine1Display,
    handleAddressSelect,
    handleAddressClear,
    registration,
    loading,
    submitError,
    onSubmit,
}) {
    const router = useRouter();

    const onInvalid = () => {};

    return (
        <div className="min-h-screen bg-background-light py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <IndividualOnboardingProgressBar />

                <header className="mb-8 px-4">
                    <h1 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                        Personal Information
                    </h1>
                    <p className="text-text-muted text-lg font-normal leading-normal">
                        Confirm your details and provide your date of birth and home address.
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                    <div className="bg-card-light border border-border-light rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-blue-50 px-6 py-4 flex items-start gap-3 border-b border-blue-100">
                            <svg className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path clipRule="evenodd" fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
                            </svg>
                            <p className="text-sm text-blue-700">
                                Your name, email, and phone from registration are already saved.
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-2">
                                    <label className="text-text-main text-sm font-semibold">Full Name</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={registration.fullName}
                                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-muted-light text-text-muted cursor-not-allowed"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-text-main text-sm font-semibold">Email Address</label>
                                    <input
                                        type="email"
                                        disabled
                                        value={registration.email}
                                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-muted-light text-text-muted cursor-not-allowed"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-text-main text-sm font-semibold">Phone Number</label>
                                    <input
                                        type="tel"
                                        disabled
                                        value={registration.phone}
                                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-muted-light text-text-muted cursor-not-allowed"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="dateOfBirth" className="text-text-main text-sm font-semibold">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="dateOfBirth"
                                        type="date"
                                        {...register("dateOfBirth")}
                                        className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                                            errors.dateOfBirth ? "border-red-500" : "border-border-light"
                                        }`}
                                    />
                                    {errors.dateOfBirth && (
                                        <p className="text-red-500 text-sm">{errors.dateOfBirth.message}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <LocationAutocomplete
                                        label="Home Address"
                                        required
                                        variant="form"
                                        restrictToAddress
                                        placeholder="e.g. 742 Evergreen Terrace, Springfield, IL"
                                        value={addressLine1Display}
                                        onChange={setAddressLine1Display}
                                        onSelect={handleAddressSelect}
                                        onClear={handleAddressClear}
                                        error={errors.addressLine1?.message}
                                        helperText="Select from the dropdown to auto-fill city, state, and ZIP"
                                    />
                                </div>

                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label htmlFor="addressLine2" className="text-text-main text-sm font-semibold">
                                        Address Line 2{" "}
                                        <span className="text-text-muted font-normal text-sm">(optional)</span>
                                    </label>
                                    <input
                                        id="addressLine2"
                                        type="text"
                                        {...register("addressLine2")}
                                        placeholder="e.g. Apt 4B"
                                        className="w-full px-4 py-3 rounded-lg border border-border-light bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="city" className="text-text-main text-sm font-semibold">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        {...register("city")}
                                        placeholder="e.g. Chicago"
                                        className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                                            errors.city ? "border-red-500" : "border-border-light"
                                        }`}
                                    />
                                    {errors.city && (
                                        <p className="text-red-500 text-sm">{errors.city.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="state" className="text-text-main text-sm font-semibold">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="state"
                                            {...register("state")}
                                            className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none ${
                                                errors.state ? "border-red-500" : "border-border-light"
                                            }`}
                                        >
                                            <option value="">Select</option>
                                            {US_STATES.map((s) => (
                                                <option key={s.code} value={s.code}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.state && (
                                            <p className="text-red-500 text-sm">{errors.state.message}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="zipCode" className="text-text-main text-sm font-semibold">
                                            ZIP Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="zipCode"
                                            type="text"
                                            inputMode="numeric"
                                            {...register("zipCode")}
                                            placeholder="e.g. 60606"
                                            maxLength={5}
                                            className={`w-full px-4 py-3 rounded-lg border bg-input-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                                                errors.zipCode ? "border-red-500" : "border-border-light"
                                            }`}
                                        />
                                        {errors.zipCode && (
                                            <p className="text-red-500 text-sm">{errors.zipCode.message}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {submitError && (
                                <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                                    <p className="text-red-700 text-sm">{submitError}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-muted-light flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-light">
                            <button
                                type="button"
                                onClick={() => router.push("/customer/onboarding/individual/welcome")}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-12 text-text-muted font-bold hover:text-text-main transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-10 h-12 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:brightness-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Save & Continue"}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}