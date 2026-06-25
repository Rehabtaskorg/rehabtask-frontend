"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useIndividualOnboardingStore = create(
    persist(
        (set) => ({
            currentStep: 1,
            completedSteps: [],

            personalInfo: {
                dateOfBirth: "",
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                zipCode: "",
            },

            medicalInfo: {
                primaryDiagnosis: "",
                referringProviderName: "",
            },

            therapyOrderDocument: null,

            setCurrentStep: (step) => set({ currentStep: step }),

            markStepComplete: (step) =>
                set((state) => ({
                    completedSteps: [...new Set([...state.completedSteps, step])],
                })),

            updatePersonalInfo: (data) =>
                set((state) => ({
                    personalInfo: { ...state.personalInfo, ...data },
                })),

            updateMedicalInfo: (data) =>
                set((state) => ({
                    medicalInfo: { ...state.medicalInfo, ...data },
                })),

            setTherapyOrderDocument: (doc) => set({ therapyOrderDocument: doc }),

            reset: () =>
                set({
                    currentStep: 1,
                    completedSteps: [],
                    personalInfo: {
                        dateOfBirth: "",
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        state: "",
                        zipCode: "",
                    },
                    medicalInfo: {
                        primaryDiagnosis: "",
                        referringProviderName: "",
                    },
                    therapyOrderDocument: null,
                }),
        }),
        {
            name: "individual-onboarding",
            partialize: (state) => ({
                currentStep: state.currentStep,
                completedSteps: state.completedSteps,
                personalInfo: state.personalInfo,
                medicalInfo: state.medicalInfo,
                therapyOrderDocument: state.therapyOrderDocument,
            }),
        }
    )
);

export default useIndividualOnboardingStore;