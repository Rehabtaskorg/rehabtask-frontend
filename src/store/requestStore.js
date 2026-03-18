"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useRequestStore = create(
    persist(
        (set, get) => ({
            currentStep: 1,
            patientId: null,
            editingRequestId: null,
            step1: {
                serviceType: "",
                description: "",
                preferredDate: "",
                preferredTime: "",
                rate: "",
                visitType: "",
                emr: "",
                emrOther: "",
                visitTypeOther: "",
            },
            step2: {
                address: "",
                latitude: null,
                longitude: null,
            },

            // Actions
            setPatientId: (id) => set({ patientId: id }),
            setStep1: (data) => set((s) => ({ step1: { ...s.step1, ...data } })),
            setStep2: (data) => set((s) => ({ step2: { ...s.step2, ...data } })),
            nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 3) })),
            prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
            goToStep: (step) => set({ currentStep: step }),
            reset: () =>
                set({
                    currentStep: 1,
                    patientId: null,
                    editingRequestId: null,
                    step1: { serviceType: "", description: "", preferredDate: "", preferredTime: "", rate: "", visitType: "", emr: "", emrOther: "", visitTypeOther: "" },
                    step2: { address: "", latitude: null, longitude: null },
                }),

            // Edit mode: pre-fill store from an existing request
            setEditData: (request) => {
                const date = request.preferredDate ? new Date(request.preferredDate) : null;
                const preferredDate = date ? date.toISOString().split("T")[0] : "";
                const preferredTime = date ? date.toTimeString().slice(0, 5) : "";

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
                        visitType: request.visitType || "",
                        emr: request.emr || "",
                        emrOther: "",
                        visitTypeOther: "",
                    },
                    step2: {
                        address: request.location || "",
                        latitude: request.latitude ? parseFloat(request.latitude) : null,
                        longitude: request.longitude ? parseFloat(request.longitude) : null,
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
                editingRequestId: state.editingRequestId,
                step1: state.step1,
                step2: state.step2,
            }),
            merge: (persisted, current) => ({
                ...current,
                ...persisted,
                step1: {
                    ...current.step1,
                    ...(persisted?.step1 || {}),
                },
                step2: {
                    ...current.step2,
                    ...(persisted?.step2 || {}),
                },
            }),
        }
    )
);

export default useRequestStore;