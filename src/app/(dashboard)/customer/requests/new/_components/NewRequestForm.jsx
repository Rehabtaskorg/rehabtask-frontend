"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { authAPi } from "@/lib/auth.api";
import useRequestStore from "@/store/requestStore";
import { usePatients } from "@/hooks/usePatients";
import RequestStepper from "./RequestStepper";
import RequestFormFooter from "./RequestFormFooter";
import Step1ServiceDetails from "./Step1ServiceDetails";
import Step2Location from "./Step2Location";
import Step3Review from "./Step3Review";
import { MdArrowBack, MdPerson, MdAdd, MdLock, MdWarning } from "react-icons/md";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSubscription } from "@/hooks/useSubscription";
import { REQUEST_TYPE, LICENSE_TYPE_TO_SERVICE_TYPE, CUSTOMER_TYPES } from "@/lib/constants";
import { useAnalytics } from "@/hooks/useAnalytics";

/**
 * @param {{ editId: string|null, directTo: string|null }} props
 */
export default function NewRequestForm({ editId, directTo }) {
    const router = useRouter();
    const { trackEvent } = useAnalytics();

    const {
        currentStep, nextStep, prevStep, reset, getPreferredDateISO,
        step1, step2, patientId, setPatientId, setStep2, setEditData,
        targetTherapistId, setTargetTherapistId,
    } = useRequestStore();

    const isEditMode = !!editId;
    const isDirectMode = !!directTo;

    usePageTitle(isEditMode ? "Edit Request" : isDirectMode ? "Create Direct Request" : "Create New Request");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [loadingRequest, setLoadingRequest] = useState(!!editId);
    const [hasOffers, setHasOffers] = useState(false);
    const [user, setUser] = useState(null);
    const [targetTherapistLicenseType, setTargetTherapistLicenseType] = useState(null);

    const { subscription, usage } = useSubscription();
    const jobPostingLimit = subscription?.jobPostingLimit;
    const isAtRequestLimit = !isEditMode && jobPostingLimit !== null && jobPostingLimit < 999999 && usage.activeJobPostings >= jobPostingLimit;

    useEffect(() => {
        trackEvent("request_form_started", { is_direct: !!directTo, is_edit: !!editId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isAtRequestLimit) {
            trackEvent("subscription_limit_reached", {
                limit_type: "requests",
                plan_type: subscription?.planType ?? null,
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAtRequestLimit]);

    useEffect(() => {
        if (directTo) {
            if (targetTherapistId !== directTo) setTargetTherapistId(directTo);
        } else {
            if (targetTherapistId) setTargetTherapistId(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [directTo, editId]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authAPi.getCurrentUser();
                setUser(res.data.data.user);
            } catch {
                // supplementary — layout handles auth
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        if (!directTo) {
            setTargetTherapistLicenseType(null);
            return;
        }
        api.get(`/therapists/${directTo}`)
            .then((res) => setTargetTherapistLicenseType(res.data.data?.primaryLicenseType ?? null))
            .catch(() => setTargetTherapistLicenseType(null));
    }, [directTo]);

    useEffect(() => {
        if (!editId) {
            reset();
            setLoadingRequest(false);
            return;
        }

        let cancelled = false;
        const fetchRequest = async () => {
            try {
                const res = await api.get(`/requests/${editId}`);
                const request = res.data.data;
                if (cancelled) return;
                if (!["created", "offers_received"].includes(request.status)) {
                    router.replace("/customer/requests");
                    return;
                }
                setEditData(request);
                setHasOffers((request.offers?.length || 0) > 0);
            } catch {
                if (!cancelled) setError("Failed to load request. It may have been deleted.");
            } finally {
                if (!cancelled) setLoadingRequest(false);
            }
        };
        fetchRequest();
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isAgency = user?.profile?.customerType === CUSTOMER_TYPES.AGENCY;
    const { data: patients } = usePatients();
    const selectedPatient = patients?.find((p) => p.id === patientId) || null;

    const handleSelectPatient = (id) => {
        setPatientId(id);
        if (id) {
            const p = patients?.find((pt) => pt.id === id);
            if (p?.addressLine1 && p?.latitude != null && p?.longitude != null) {
                const fullAddress = [p.addressLine1, p.city, p.state, p.zipCode].filter(Boolean).join(", ");
                setStep2({ address: fullAddress, latitude: parseFloat(p.latitude), longitude: parseFloat(p.longitude) });
            }
        } else {
            setStep2({ address: "", latitude: null, longitude: null });
        }
    };

    const handleNext = () => {
        trackEvent("request_step_completed", { step: currentStep, service_type: step1.serviceType });
        nextStep();
    };

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
                trackEvent("request_edited", { service_type: step1.serviceType });
            } else {
                payload.patientId = isAgency && !isDirectMode ? patientId : undefined;
                const requestType = isDirectMode && targetTherapistId ? REQUEST_TYPE.DIRECT : REQUEST_TYPE.PUBLIC;
                if (requestType === REQUEST_TYPE.DIRECT) {
                    payload.requestType = REQUEST_TYPE.DIRECT;
                    payload.targetTherapistId = targetTherapistId;
                }
                await api.post("/requests", payload);
                trackEvent("request_submitted", {
                    service_type: step1.serviceType,
                    request_type: requestType,
                    has_patient: isAgency && !!patientId,
                    has_visit_type: !!(step1.visitTypeId || step1.visitType),
                    has_emr: !!step1.emr,
                });
            }

            reset();
            router.push("/customer/requests");
        } catch (err) {
            const msg = isEditMode ? "Failed to update request." : "Failed to create request.";
            setError(err.response?.data?.message || `${msg} Please try again.`);
            setSubmitting(false);
        }
    };

    const hasVisitType = Boolean(step1.visitTypeId) || Boolean(step1.visitType && (step1.visitType !== "Other" || step1.visitTypeOther.trim()));
    const rateValue = parseFloat(step1.rate);
    const isStep1Valid =
        step1.serviceType &&
        step1.description.trim().length >= 10 &&
        step1.preferredDate &&
        step1.rate && rateValue > 0 && rateValue <= 9999.99 &&
        hasVisitType &&
        step1.emr && (step1.emr !== "Other" || step1.emrOther.trim());
    const isStep2Valid = step2.address && step2.latitude !== null && step2.longitude !== null;
    const isPatientValid = isEditMode || !isAgency || patientId;

    if (isAtRequestLimit) {
        return (
            <div className="max-w-lg mx-auto mt-20 text-center">
                <div className="bg-card-light  rounded-xl border border-border-light  p-8 shadow-sm">
                    <MdLock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-text-main  mb-2">Request Limit Reached</h2>
                    <p className="text-text-muted  mb-4">
                        You&apos;ve used all {jobPostingLimit} of your active job posting slots ({usage.activeJobPostings}/{jobPostingLimit}).
                        Upgrade your plan to post more jobs.
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

                <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-28">
                    <div className="max-w-170 mx-auto space-y-8">
                        <RequestStepper currentStep={currentStep} />

                        {isDirectMode && currentStep === 1 && (
                            <div className="flex items-start gap-3 bg-indigo-50  border border-indigo-200  rounded-xl p-4">
                                <MdPerson className="text-indigo-500 text-xl shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-indigo-800 ">This is a direct request</p>
                                    <p className="text-xs text-indigo-700  mt-0.5">
                                        Only the therapist you selected from your conversation will see this request. It will not be visible to any other therapists.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isDirectMode && currentStep === 1 && (() => {
                            if (!targetTherapistLicenseType || !step1.serviceType) return null;
                            const expectedServiceType = LICENSE_TYPE_TO_SERVICE_TYPE[targetTherapistLicenseType];
                            if (!expectedServiceType || step1.serviceType === expectedServiceType) return null;
                            return (
                                <div className="flex items-start gap-3 bg-amber-50  border border-amber-200  rounded-xl p-4">
                                    <MdWarning className="text-amber-500 text-xl shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-amber-800 ">Service type may not match this therapist</p>
                                        <p className="text-xs text-amber-700  mt-0.5">
                                            The therapist you selected is a <strong>{targetTherapistLicenseType}</strong>, who typically handles <strong>{expectedServiceType}</strong> requests. You can still submit — they will review and respond.
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {isEditMode && hasOffers && currentStep === 1 && (
                            <div className="flex items-start gap-3 bg-amber-50  border border-amber-200  rounded-xl p-4">
                                <MdWarning className="text-amber-500 text-xl shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800 ">This request has pending offers</p>
                                    <p className="text-xs text-amber-700  mt-0.5">
                                        Updating this request will automatically withdraw all pending offers. Affected therapists will be notified and can submit new offers on the updated request.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isAgency && !isEditMode && currentStep === 1 && (
                            <div className="bg-primary/5  border border-primary/20 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdPerson className="text-primary text-lg" />
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-wider">Select Patient</p>
                                </div>
                                {selectedPatient ? (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                                                {selectedPatient.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-text-main ">{selectedPatient.fullName}</p>
                                                {selectedPatient.addressLine1 && (
                                                    <p className="text-xs text-text-muted ">
                                                        {selectedPatient.addressLine1}, {selectedPatient.city || ""} {selectedPatient.state || ""}
                                                    </p>
                                                )}
                                                {!selectedPatient.addressLine1 && selectedPatient.email && (
                                                    <p className="text-xs text-text-muted ">{selectedPatient.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleSelectPatient(null)} className="text-primary text-sm font-bold hover:underline">
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
                                        <Link href="/customer/patients" className="inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline mt-2">
                                            <MdAdd className="text-sm" />
                                            Add a new patient
                                        </Link>
                                        {!patientId && (
                                            <p className="text-xs text-amber-600  mt-1">A patient must be selected to continue.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {isEditMode && isAgency && selectedPatient && currentStep === 1 && (
                            <div className="bg-primary/5  border border-primary/20 rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdPerson className="text-primary text-lg" />
                                    <p className="text-xs font-bold text-text-muted  uppercase tracking-wider">Patient (cannot be changed)</p>
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
                                {isAgency && selectedPatient && (
                                    <div className="bg-primary/5  border border-primary/20 rounded-lg p-4 flex items-center gap-3">
                                        <MdPerson className="text-primary text-lg shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-text-muted  uppercase">Patient</p>
                                            <p className="text-sm font-semibold text-text-main ">{selectedPatient.fullName}</p>
                                        </div>
                                    </div>
                                )}
                                <Step3Review onEditStep={(s) => useRequestStore.getState().goToStep(s)} />
                            </>
                        )}

                        {error && (
                            <div className="bg-red-50  border border-red-200  text-red-700  px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

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
