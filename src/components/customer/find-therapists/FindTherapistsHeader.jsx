"use client";

import { useRouter } from "next/navigation";
import { MdAdd } from "react-icons/md";
import useRequestStore from "@/stores/requestStore";
import LocationAutocomplete from "@/components/maps/LocationAutocomplete";
import LicenseTypeAutocomplete from "@/components/public/LicenseTypeAutocomplete";

export default function FindTherapistsHeader({
    resultCount,
    isLoading,
    licenseType,
    onLicenseTypeChange,
    locationInput,
    setLocationInput,
    onLocationSelect,
    onLocationClear,
    onSearch,
}) {
    const router = useRouter();
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <section className="bg-card-light  border-b border-border-light ">
            <div className="px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="shrink-0">
                        <h2 className="text-xl font-black tracking-tight text-text-main ">
                            Find Therapists
                        </h2>
                        {!isLoading && (
                            <p className="text-xs text-text-muted  -mt-0.5">
                                {resultCount} therapist{resultCount !== 1 ? "s" : ""} found
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 lg:mx-4"
                    >
                        <LicenseTypeAutocomplete
                            value={licenseType}
                            onChange={onLicenseTypeChange}
                            placeholder="Discipline type"
                            variant="compact"
                        />

                        <div className="md:flex-1 md:max-w-sm">
                            <LocationAutocomplete
                                value={locationInput}
                                onChange={setLocationInput}
                                onSelect={onLocationSelect}
                                onClear={onLocationClear}
                                placeholder="City or zip code"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm shrink-0"
                        >
                            Search
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => { useRequestStore.persist.clearStorage(); useRequestStore.getState().reset(); window.location.href = "/customer/requests/new"; }}
                        className="hidden lg:flex shrink-0 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg text-sm font-bold items-center gap-2 transition-colors"
                    >
                        <MdAdd className="text-lg" />
                        Create a Request
                    </button>
                </div>
            </div>
        </section>
    );
}
