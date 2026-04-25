"use client";

import { useRouter } from "next/navigation";
import { MdAdd, MdSearch } from "react-icons/md";
import LocationAutocomplete from "@/components/public/LocationAutocomplete";

export default function FindTherapistsHeader({
    resultCount,
    isLoading,
    searchInput,
    setSearchInput,
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
        <section className="bg-card-light dark:bg-card-dark border-b border-border-light dark:border-border-dark">
            <div className="px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="shrink-0">
                        <h2 className="text-xl font-black tracking-tight text-text-main dark:text-white">
                            Find Therapists
                        </h2>
                        {!isLoading && (
                            <p className="text-xs text-text-muted dark:text-gray-400 -mt-0.5">
                                {resultCount} therapist{resultCount !== 1 ? "s" : ""} found
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-2 lg:mx-4"
                    >
                        <div className="flex-1 flex items-center bg-input-light dark:bg-input-dark px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark min-w-0">
                            <MdSearch className="text-text-muted text-lg mr-2 shrink-0" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by name"
                                className="bg-transparent border-none focus:ring-0 focus:outline-none text-text-main dark:text-white w-full placeholder:text-text-muted text-sm"
                            />
                        </div>

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
                        onClick={() => router.push("/customer/requests/new")}
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
