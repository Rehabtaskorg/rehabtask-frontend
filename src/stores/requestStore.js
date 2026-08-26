"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localDateStr, localDateTimeParts } from "@/utils/dates";

const INITIAL_STEP1 = {
    serviceType: "",
    description: "",
    preferredDate: "",
    preferredTime: "",
    rate: "",
    visitType: "",
    visitTypeId: "",
    visitTypeName: "",
    emr: "",
    emrOther: "",
    visitTypeOther: "",
    specialInstructions: "",
    visitsPerWeek: "",
    numberOfWeeks: "",
};

const INITIAL_STEP2 = {
    address: "",
    latitude: null,
    longitude: null,
};

const useRequestStore = create(
    persist(
        (set, get) => ({
            currentStep: 1,
            patientId: null,
            targetTherapistId: null,
            editingRequestId: null,
            step1: { ...INITIAL_STEP1 },
            step2: { ...INITIAL_STEP2 },

            // Actions
            setPatientId: (id) => set({ patientId: id }),
            setTargetTherapistId: (id) => set({ targetTherapistId: id }),
            setStep1: (data) => set((s) => ({ step1: { ...s.step1, ...data } })),
            setStep2: (data) => set((s) => ({ step2: { ...s.step2, ...data } })),
            nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 3) })),
            prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
            goToStep: (step) => set({ currentStep: step }),
            reset: () =>
                set({
                    currentStep: 1,
                    patientId: null,
                    targetTherapistId: null,
                    editingRequestId: null,
                    step1: { ...INITIAL_STEP1 },
                    step2: { ...INITIAL_STEP2 },
                }),

            // Edit mode: pre-fill store from an existing request
            setEditData: (request) => {
                const date = request.preferredDate ? new Date(request.preferredDate) : null;
                const { date: preferredDate, time: preferredTime } = date
                    ? localDateTimeParts(date)
                    : { date: "", time: "" };

                set({
                    editingRequestId: request.id,
                    currentStep: 1,
                    patientId: request.patientId || null,
                    step1: {
                        serviceType: request.serviceType || "",
                        description: request.description || "",
                        preferredDate,
                        preferredTime,
                        rate: request.rate ? String(parseFloat(request.rate)) : "",
                        // Prefer FK if populated; fall back to legacy string
                        visitType: request.visitTypeRef ? "" : (request.visitType || ""),
                        visitTypeId: request.visitTypeId || request.visitTypeRef?.id || "",
                        visitTypeName: request.visitTypeRef?.name || "",
                        emr: request.emr || "",
                        emrOther: "",
                        visitTypeOther: "",
                        specialInstructions: request.specialInstructions || "",
                        visitsPerWeek: request.visitsPerWeek ? String(request.visitsPerWeek) : "",
                        numberOfWeeks: request.numberOfWeeks ? String(request.numberOfWeeks) : "",
                    },
                    step2: {
                        address: request.location || "",
                        latitude: request.latitude != null ? parseFloat(request.latitude) : null,
                        longitude: request.longitude != null ? parseFloat(request.longitude) : null,
                    },
                });
            },

            // Computed: build ISO preferredData from date + time
            getPreferredDateISO: () => {
                const { preferredDate, preferredTime } = get().step1;
                if (!preferredDate) return null;
                const dateTime = preferredTime
                    ? `${preferredDate}T${preferredTime}`
                    : `${preferredDate}T09:00`;
                return new Date(dateTime).toISOString();
            },
        }),
        {
            name: "new-request-form",
            partialize: (state) => ({
                currentStep: state.currentStep,
                patientId: state.patientId,
                targetTherapistId: state.targetTherapistId,
                editingRequestId: state.editingRequestId,
                step1: state.step1,
                step2: state.step2,
            }),
            merge: (persisted, current) => {
                const persistedStep1 = persisted?.step1 || {};
                const stalePastDate =
                    persistedStep1.preferredDate &&
                    persistedStep1.preferredDate < localDateStr();
                return {
                    ...current,
                    ...persisted,
                    step1: {
                        ...current.step1,
                        ...persistedStep1,
                        ...(stalePastDate ? { preferredDate: "" } : {}),
                    },
                    step2: {
                        ...current.step2,
                        ...(persisted?.step2 || {}),
                    },
                };
            },
        }
    )
);

export default useRequestStore;