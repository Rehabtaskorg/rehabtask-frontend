"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { authAPi } from "@/lib/auth.api";
import useRequestStore from "@/store/requestStore";
import { usePatients } from "@/hooks/usePatients";
import RequestStepper from "./_components/RequestStepper";
import RequestFormFooter from "./_components/RequestFormFooter";
import Step1ServiceDetails from "./_components/Step1ServiceDetails";
import Step2Location from "./_components/Step2Location";
import Step3Review from "./_components/Step3Review";
import { MdArrowBack, MdPerson, MdAdd, MdLock, MdWarning } from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSubscription } from "@/hooks/useSubscription";
import { REQUEST_TYPE, LICENSE_TYPE_TO_SERVICE_TYPE } from "@/lib/constants";

export default function NewRequestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const directTo = searchParams.get("directTo"); // therapistProfile.id for direct requests

    const {
        currentStep, nextStep, prevStep, reset, getPreferredDateISO,
        step1, step2, patientId, setPatientId, setStep2, editingRequestId, setEditData,
        targetTherapistId, setTargetTherapistId,
    } = useRequestStore();

    const isEditMode = !!editId;
    const isDirectMode = !!directTo;

    // Sync directTo param into store when navigating from messages page
    useEffect(() => {
        if (directTo && targetTherapistId !== directTo) {
            setTargetTherapistId(directTo);
        }
        if (!directTo && !editId && targetTherapistId) {
            setTargetTherapistId(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [directTo]);

    usePageTitle(isEditMode ? "Edit Request" : isDirectMode ? "Create Direct Request" : "Create New Request");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [loadingRequest, setLoadingRequest] = useState(!!editId);
    const [hasOffers, setHasOffers] = useState(false);
    const { subscription, usage } = useSubscription();

    const requestLimit = subscription?.requestLimit;
    const isAtRequestLimit = !isEditMode && requestLimit !== null && requestLimit < 999999 && usage.activeRequests >= requestLimit;
    const [user, setUser] = useState(null);
    const [targetTherapistLicenseType, setTargetTherapistLicenseType] = useState(null);

    // Fetch user to check customerType
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authAPi.getCurrentUser();
                setUser(res.data.data.user);
            } catch (err) {
                // User context is handled by layout; this is supplementary
            }
        };
        fetchUser();
    }, []);

    // In direct mode, fetch the target therapist's license type for the mismatch warning.
    // Non-blocking — if it fails, the form still works, warning just won't show.
    useEffect(() => {
        if (!directTo) {
            setTargetTherapistLicenseType(null);
            return;
        }
        api.get(`/therapists/${directTo}`)
            .then((res) => {
                setTargetTherapistLicenseType(res.data.data?.primaryLicenseType ?? null);
            })
            .catch(() => {
                setTargetTherapistLicenseType(null);
            });
    }, [directTo]);

    // Edit mode: fetch existing request and pre-fill store
    useEffect(() => {
        if (!editId) {
            // If navigating to create mode but store has stale edit data, reset it
            if (editingRequestId) {
                reset();
            }
            setLoadingRequest(false);
            return;
        }

        // Skip if store already has the correct edit data
        if (editingRequestId === editId) {
            setLoadingRequest(false);
            return;
        }

        const fetchRequest = async () => {
            try {
                const res = await api.get(`/requests/${editId}`);
                const request = res.data.data;

                // Verify the request is editable
                if (!["created", "offers_received"].includes(request.status)) {
                    router.replace("/customer/requests");
                    return;
                }

                setEditData(request);
                setHasOffers((request.offers?.length || 0) > 0);
            } catch (err) {
                setError("Failed to load request. It may have been deleted.");
            } finally {
                setLoadingRequest(false);
            }
        };
        fetchRequest();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editId]);

    const isAgency = user?.profile?.customerType === "agency";
    const { data: patients } = usePatients();
    const selectedPatient = patients?.find((p) => p.id === patientId) || null;

    const handleSelectPatient = (id) => {
        setPatientId(id);
        if (id) {
            const p = patients?.find((pt) => pt.id === id);
            if (p?.addressLine1 && p?.latitude != null && p?.longitude != null) {
                const fullAddress = [p.addressLine1, p.city, p.state, p.zipCode].filter(Boolean).join(", ");
                setStep2({
                    address: fullAddress,
                    latitude: parseFloat(p.latitude),
                    longitude: parseFloat(p.longitude),
                });
            }
        } else {
            setStep2({ address: "", latitude: null, longitude: null });
        }
    };

    const handleNext = () => nextStep();
    const handleBack = () => {
        if (currentStep === 1) {
            router.push("/customer/requests");
        } else {
            prevStep();
        }
    };

    const handleSubmit = async () => {
        setError("");
        setSubmitting(true);
        try {
            const payload = {
                serviceType: step1.serviceType,
                description: step1.description,
                preferredDate: getPreferredDateISO(),
                location: step2.address,
                latitude: step2.latitude,
                longitude: step2.longitude,
                rate: parseFloat(step1.rate),
                ...(step1.visitTypeId
                    ? { visitTypeId: step1.visitTypeId }
                    : { visitType: step1.visitType === "Other" ? step1.visitTypeOther : step1.visitType }),
                emr: step1.emr === "Other" ? step1.emrOther : step1.emr,
                ...(step1.visitsPerWeek && { visitsPerWeek: parseInt(step1.visitsPerWeek) }),
                ...(step1.numberOfWeeks && { numberOfWeeks: parseInt(step1.numberOfWeeks) }),
            };

            if (isEditMode) {
                await api.put(`/requests/${editId}`, payload);
            } else {
                payload.patientId = isAgency && !isDirectMode ? patientId : undefined;
                if (isDirectMode && targetTherapistId) {
                    payload.requestType = REQUEST_TYPE.DIRECT;
                    payload.targetTherapistId = targetTherapistId;
                }
                await api.post("/requests", payload);
            }

            reset();
            router.push("/customer/requests");
        } catch (error) {
            const msg = isEditMode ? "Failed to update request." : "Failed to create request.";
            setError(error.response?.data?.message || `${msg} Please try again.`);
            setSubmitting(false);
        }
    };

    const hasVisitType = Boolean(step1.visitTypeId) || Boolean(step1.visitType && (step1.visitType !== "Other" || step1.visitTypeOther.trim()));
    const isStep1Valid =
        step1.serviceType &&
        step1.description.trim().length >= 10 &&
        step1.preferredDate &&
        step1.rate && parseFloat(step1.rate) > 0 &&
        hasVisitType &&
        step1.emr && (step1.emr !== "Other" || step1.emrOther.trim());
    const isStep2Valid =
        step2.address && step2.latitude !== null && step2.longitude !== null;

    // Agency users must select a patient before proceeding (create or direct mode)
    const isPatientValid = isEditMode || !isAgency || patientId;

    if (isAtRequestLimit) {
        return (
            <div className="max-w-lg mx-auto mt-20 text-center">
                <div className="bg-card-light  rounded-xl border border-border-light  p-8 shadow-sm">
                    <MdLock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-main  mb-2">Request Limit Reached</h2>
                    <p className="text-text-muted  mb-4">
                        You&apos;ve used all {requestLimit} of your active request slots ({usage.activeRequests}/{requestLimit}).
                        Upgrade your plan to create more requests.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/customer/requests" className="px-4 py-2 rounded-lg border border-border-light  text-text-main font-medium hover:bg-gray-50 ">
                            Back to Requests
                        </Link>
                        <Link href="/customer/subscription" className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
                            Upgrade Plan
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (loadingRequest) {
        return (
            <div className="flex flex-col min-h-full bg-background-light ">
                <header className="bg-card-light  border-b border-border-light  sticky top-0 z-10 px-4 sm:px-8 py-4">
                    <div className="max-w-170 mx-auto">
                        <div className="h-4 w-24 bg-slate-200  rounded animate-pulse mb-2" />
                        <div className="h-7 w-48 bg-slate-200  rounded animate-pulse" />
                    </div>
                </header>
                <div className="flex-1 px-4 sm:px-8 py-6">
                    <div className="max-w-170 mx-auto space-y-6">
                        <div className="h-12 bg-slate-200  rounded-xl animate-pulse" />
                        <div className="h-64 bg-slate-200  rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <div className="flex flex-col min-h-full bg-background-light ">
                {/* Sticky Header */}
                <header className="bg-card-light  border-b border-border-light  sticky top-0 z-10 px-4 sm:px-8 py-4">
                    <div className="max-w-170 mx-auto">
                        <button
                            onClick={() => router.push("/customer/requests")}
                            className="flex items-center gap-1 text-sm text-text-muted  hover:text-primary mb-1 transition-colors"
                        >
                            <MdArrowBack className="text-base" />
                            My Requests
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold text-text-main ">
                            {isEditMode ? "Edit Request" : isDirectMode ? "Create Direct Request" : "Create New Request"}
                        </h2>
                    </div>
                </header>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-28">
                    <div className="max-w-170 mx-auto space-y-8">
                        <RequestStepper currentStep={currentStep} />

                        {/* Direct request info banner */}
                        {isDirectMode && currentStep === 1 && (
                            <div className="flex items-start gap-3 bg-indigo-50  border border-indigo-200  rounded-xl p-4">
                                <MdPerson className="text-indigo-500 text-xl shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-indigo-800 ">
                                        This is a direct request
                                    </p>
                                    <p className="text-xs text-indigo-700  mt-0.5">
                                        Only the therapist you selected from your conversation will see this request. It will not be visible to any other therapists.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Discipline mismatch warning — shown when selected service type
                            does not match the target therapist's license type */}
                        {isDirectMode && currentStep === 1 && (() => {
                            if (!targetTherapistLicenseType || !step1.serviceType) return null;
                            const expectedServiceType = LICENSE_TYPE_TO_SERVICE_TYPE[targetTherapistLicenseType];
                            if (!expectedServiceType || step1.serviceType === expectedServiceType) return null;
                            return (
                                <div className="flex items-start gap-3 bg-amber-50  border border-amber-200  rounded-xl p-4">
                                    <MdWarning className="text-amber-500 text-xl shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 ">
                                            Service type may not match this therapist
                                        </p>
                                        <p className="text-xs text-amber-700  mt-0.5">
                                            The therapist you selected is a <strong>{targetTherapistLicenseType}</strong>, who typically handles <strong>{expectedServiceType}</strong> requests. You can still submit — they will review and respond.
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Warning banner: editing will withdraw offers */}
                        {isEditMode && hasOffers && currentStep === 1 && (
                            <div className="flex items-start gap-3 bg-amber-50  border border-amber-200  rounded-xl p-4">
                                <MdWarning className="text-amber-500 text-xl shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800 ">
                                        This request has pending offers
                                    </p>
                                    <p className="text-xs text-amber-700  mt-0.5">
                                        Updating this request will automatically withdraw all pending offers. Affected therapists will be notified and can submit new offers on the updated request.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Patient Selector — agency only, create mode only, shown before Step 1 */}
                        {isAgency && !isEditMode && currentStep === 1 && (
                            <div className="bg-primary/5  border border-primary/20 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdPerson className="text-primary text-lg" />
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-wider">
                                        Select Patient
                                    </p>
                                </div>

                                {selectedPatient ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                                {selectedPatient.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main ">
                                                    {selectedPatient.fullName}
                                                </p>
                                                {selectedPatient.addressLine1 && (
                                                    <p className="text-xs text-text-muted ">
                                                        {selectedPatient.addressLine1}, {selectedPatient.city || ""} {selectedPatient.state || ""}
                                                    </p>
                                                )}
                                                {!selectedPatient.addressLine1 && selectedPatient.email && (
                                                    <p className="text-xs text-text-muted ">
                                                        {selectedPatient.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSelectPatient(null)}
                                            className="text-primary text-sm font-bold hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <select
                                            value={patientId || ""}
                                            onChange={(e) => handleSelectPatient(e.target.value || null)}
                                            className="w-full px-4 py-3 rounded-xl bg-white  border border-border-light  text-text-main  text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        >
                                            <option value="">Choose a patient...</option>
                                            {patients?.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.fullName}{p.city ? ` — ${p.city}, ${p.state || ""}` : p.email ? ` — ${p.email}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <Link
                                            href="/customer/patients"
                                            className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline mt-2"
                                        >
                                            <MdAdd className="text-sm" />
                                            Add a new patient
                                        </Link>
                                        {!patientId && (
                                            <p className="text-xs text-amber-600  mt-1">
                                                A patient must be selected to continue.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Edit mode: show patient info (read-only) */}
                        {isEditMode && isAgency && selectedPatient && currentStep === 1 && (
                            <div className="bg-primary/5  border border-primary/20 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdPerson className="text-primary text-lg" />
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-wider">
                                        Patient (cannot be changed)
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                        {selectedPatient.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-main ">{selectedPatient.fullName}</p>
                                        <p className="text-xs text-text-muted ">
                                            {selectedPatient.addressLine1
                                                ? `${selectedPatient.addressLine1}, ${selectedPatient.city || ""} ${selectedPatient.state || ""}`
                                                : selectedPatient.email || ""}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && <Step1ServiceDetails />}
                        {currentStep === 2 && <Step2Location />}
                        {currentStep === 3 && (
                            <>
                                {/* Show patient badge in review step */}
                                {isAgency && selectedPatient && (
                                    <div className="bg-primary/5  border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                                        <MdPerson className="text-primary text-lg shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-text-muted  uppercase">Patient</p>
                                            <p className="text-sm font-semibold text-text-main ">{selectedPatient.fullName}</p>
                                        </div>
                                    </div>
                                )}
                                <Step3Review
                                    onEditStep={(s) => useRequestStore.getState().goToStep(s)}
                                />
                            </>
                        )}

                        {error && (
                            <div className="bg-red-50  border border-red-200  text-red-700  px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <RequestFormFooter
                    currentStep={currentStep}
                    onBack={handleBack}
                    onNext={handleNext}
                    onSubmit={handleSubmit}
                    canNext={
                        currentStep === 1
                            ? isStep1Valid && isPatientValid
                            : currentStep === 2
                                ? isStep2Valid
                                : true
                    }
                    submitting={submitting}
                    isEditMode={isEditMode}
                />
            </div>
        </APIProvider>
    );
}