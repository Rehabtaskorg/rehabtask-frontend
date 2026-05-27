"use client";

import { ConnectAccountOnboarding } from "@stripe/react-connect-js";
import { MdError } from "react-icons/md";
import StripeConnectProvider from "@/components/stripe/StripeConnectProvider";
import StripeLoadErrorCard from "./StripeLoadErrorCard";

/**
 * Renders the Stripe embedded onboarding iframe inside a card.
 * Shows an animated skeleton while the Stripe SDK initialises (1–3s),
 * then transitions to the live form once onLoaderStart fires.
 *
 * On load failure, silently retries once by incrementing retryKey.
 * If the retry also fails, StripeLoadErrorCard is shown.
 *
 * @param {{ onExit: () => void, onRetry: () => void, retryKey: number, embeddedFormLoaded: boolean, onLoaderStart: () => void, onLoadError: () => void, loadFailed: boolean, incompleteError: string|null }} props
 */
export default function StripeEmbeddedForm({
    onExit,
    onRetry,
    retryKey,
    embeddedFormLoaded,
    onLoaderStart,
    onLoadError,
    loadFailed,
    incompleteError,
}) {
    return (
        <div className="space-y-4">
            {incompleteError && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <MdError className="text-amber-500 text-xl shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-sm">{incompleteError}</p>
                </div>
            )}

            {loadFailed ? (
                <StripeLoadErrorCard onRetry={onRetry} />
            ) : (
                <div className="bg-card-light border border-border-light rounded-xl shadow-sm p-6 md:p-8">
                    {!embeddedFormLoaded && (
                        <div className="animate-pulse space-y-5">
                            <div className="h-6 w-48 bg-slate-200 rounded" />
                            <div className="space-y-3 pt-2">
                                <div className="h-4 w-32 bg-slate-200 rounded" />
                                <div className="h-11 w-full bg-slate-100 rounded-lg" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-40 bg-slate-200 rounded" />
                                <div className="h-11 w-full bg-slate-100 rounded-lg" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-36 bg-slate-200 rounded" />
                                <div className="h-11 w-full bg-slate-100 rounded-lg" />
                            </div>
                            <div className="flex justify-end pt-2">
                                <div className="h-10 w-28 bg-slate-200 rounded-lg" />
                            </div>
                        </div>
                    )}
                    <div className={embeddedFormLoaded ? "" : "hidden"}>
                        <StripeConnectProvider retryKey={retryKey}>
                            <ConnectAccountOnboarding
                                onExit={onExit}
                                onLoadError={onLoadError}
                                onLoaderStart={onLoaderStart}
                                collectionOptions={{
                                    fields: "eventually_due",
                                    futureRequirements: "include",
                                }}
                            />
                        </StripeConnectProvider>
                    </div>
                </div>
            )}
        </div>
    );
}