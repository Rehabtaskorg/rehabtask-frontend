"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAgencyOnboardingStore = create(
    persist(
        (set) => ({
            currentStep: 1,
            completedSteps: [],

            businessProfile: {
                dbaName: "",
                ein: "",
                billingEmail: "",
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                zipCode: "",
            },

            setCurrentStep: (step) => set({ currentStep: step }),

            markStepComplete: (step) =>
                set((state) => ({
                    completedSteps: [...new Set([...state.completedSteps, step])],
                })),

            updateBusinessProfile: (data) =>
                set((state) => ({
                    businessProfile: { ...state.businessProfile, ...data },
                })),

            reset: () =>
                set({
                    currentStep: 1,
                    completedSteps: [],
                    businessProfile: {
                        dbaName: "",
                        ein: "",
                        billingEmail: "",
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        state: "",
                        zipCode: "",
                    },
                }),
        }),
        {
            name: "agency-onboarding",
            partialize: (state) => ({
                currentStep: state.currentStep,
                completedSteps: state.completedSteps,
                businessProfile: state.businessProfile,
            }),
        }
    )
);

export default useAgencyOnboardingStore;
