"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TIME_BLOCK } from "@/lib/onboardingValidation";

const initialSchedule = {
    monday: { enabled: false, timeBlocks: [] },
    tuesday: { enabled: false, timeBlocks: [] },
    wednesday: { enabled: false, timeBlocks: [] },
    thursday: { enabled: false, timeBlocks: [] },
    friday: { enabled: false, timeBlocks: [] },
    saturday: { enabled: false, timeBlocks: [] },
    sunday: { enabled: false, timeBlocks: [] },
};


const useOnboardingStore = create(
    persist(
        (set, get) => ({
            currentStep: 1,
            completedSteps: [],

            professionalProfile: {
                yearsOfExperience: null,
                primaryLicenseType: "",
                specialization: "",
                professionalSummary: "",
                profilePhotoUrl: null,
            },

            credentials: {
                licenseNumber: "",
                licenseState: "",
                licenseDocuments: []
            },

            availability: {
                schedule: initialSchedule,
                acceptingNewPatients: true,
                workAreas: [],
            },

            backgroundCheck: {
                consent: false,
                signature: "",
                submittedAt: null,
            },

            payment: {
                stripeConnected: false,
                stripeAccountId: null,
                onboardingComplete: false
            },

            // Actions
            setCurrentStep: (step) => set({ currentStep: step }),

            markStepComplete: (step) =>
                set((state) => ({
                    completedSteps: [...new Set([...state.completedSteps, step])],
                })),

            updateProfessionalProfile: (data) =>
                set((state) => ({
                    professionalProfile: { ...state.professionalProfile, ...data },
                })),

            updateCredentials: (data) =>
                set((state) => ({
                    credentials: { ...state.credentials, ...data },
                })),

            addLicenseDocument: (doc) =>
                set((state) => ({
                    credentials: {
                        ...state.credentials,
                        licenseDocuments: [...state.credentials.licenseDocuments, doc],
                    },
                })),

            removeLicenseDocument: (index) =>
                set((state) => ({
                    credentials: {
                        ...state.credentials,
                        licenseDocuments: state.credentials.licenseDocuments.filter(
                            (_, i) => i !== index
                        ),
                    },
                })),

            updateAvailability: (data) =>
                set((state) => ({
                    availability: { ...state.availability, ...data }
                })),

            addWorkArea: (area) =>
                set((state) => ({
                    availability: {
                        ...state.availability,
                        workAreas: [...state.availability.workAreas, area],
                    },
                })),

            updateWorkArea: (index, area) =>
                set((state) => ({
                    availability: {
                        ...state.availability,
                        workAreas: state.availability.workAreas.map((wa, i) =>
                            i === index ? area : wa
                        ),
                    },
                })),

            removeWorkArea: (index) =>
                set((state) => ({
                    availability: {
                        ...state.availability,
                        workAreas: state.availability.workAreas.filter(
                            (_, i) => i !== index
                        ),
                    },
                })),

            toggleDayAvailability: (day) => {
                const current = get().availability.schedule[day];
                const schedule = { ...get().availability.schedule };
                schedule[day] = {
                    ...current,
                    enabled: !current.enabled,
                    timeBlocks: !current.enabled && current.timeBlocks.length === 0
                        ? [DEFAULT_TIME_BLOCK]
                        : current.timeBlocks,
                };
                set({ availability: { ...get().availability, schedule } });
            },

            addTimeBlock: (day, block = DEFAULT_TIME_BLOCK) => {
                const schedule = { ...get().availability.schedule };
                schedule[day].timeBlocks.push(block);
                set({ availability: { ...get().availability, schedule } });
            },

            removeTimeBlock: (day, index) => {
                const schedule = { ...get().availability.schedule };
                schedule[day].timeBlocks.splice(index, 1);
                set({ availability: { ...get().availability, schedule } });
            },

            updateTimeBlock: (day, index, updatedBlock) =>
                set((state) => ({
                    availability: {
                        ...state.availability,
                        schedule: {
                            ...state.availability.schedule,
                            [day]: {
                                ...state.availability.schedule[day],
                                timeBlocks: state.availability.schedule[day].timeBlocks.map(
                                    (block, i) => (i === index ? updatedBlock : block)
                                ),
                            },
                        },
                    },
                })),

            applyScheduleToWeekdays: () => {
                const schedule = { ...get().availability.schedule };
                const ref = Object.values(schedule).find(d => d.enabled && d.timeBlocks.length)
                    || { timeBlocks: [DEFAULT_TIME_BLOCK] };

                ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach(day => {
                    schedule[day] = { enabled: true, timeBlocks: [...ref.timeBlocks] };
                });

                set({ availability: { ...get().availability, schedule } });
            },


            applyScheduleToAllDays: () => {
                const schedule = { ...get().availability.schedule };
                const ref = Object.values(schedule).find(d => d.enabled && d.timeBlocks.length)
                    || { timeBlocks: [DEFAULT_TIME_BLOCK] };

                Object.keys(schedule).forEach(day => {
                    schedule[day] = { enabled: true, timeBlocks: [...ref.timeBlocks] };
                });

                set({ availability: { ...get().availability, schedule } });
            },


            updateBackgroundCheck: (data) =>
                set((state) => ({
                    backgroundCheck: { ...state.backgroundCheck, ...data },
                })),

            updatePayment: (data) =>
                set((state) => ({
                    payment: { ...state.payment, ...data },
                })),

            markStripeConnected: (accountId) =>
                set({
                    payment: {
                        stripeConnected: true,
                        stripeAccountId: accountId,
                        onboardingComplete: true,
                    },
                }),

            getAllData: () => {
                const state = get();
                return {
                    professionalProfile: state.professionalProfile,
                    credentials: state.credentials,
                    availability: state.availability,
                    backgroundCheck: state.backgroundCheck,
                    payment: state.payment,
                    currentStep: state.currentStep,
                    completedSteps: state.completedSteps,
                };
            },

            getProgress: () => {
                const state = get();
                const totalSteps = 5;
                const completed = state.completedSteps.length;
                return Math.round((completed / totalSteps) * 100);
            },

            isStepCompleted: (step) => {
                const state = get();
                return state.completedSteps.includes(step);
            },

            reset: () =>
                set({
                    currentStep: 1,
                    completedSteps: [],
                    professionalProfile: {
                        yearsOfExperience: null,
                        primaryLicenseType: "",
                        specialization: "",
                        professionalSummary: "",
                        profilePhotoUrl: null,
                    },
                    credentials: {
                        licenseNumber: "",
                        licenseState: "",
                        licenseDocuments: [],
                    },
                    availability: {
                        schedule: initialSchedule,
                        acceptingNewPatients: true,
                        workAreas: [],
                    },
                    backgroundCheck: {
                        consent: false,
                        signature: "",
                        submittedAt: null,
                    },
                    payment: {
                        stripeConnected: false,
                        stripeAccountId: null,
                        onboardingComplete: false,
                    },
                })
        }),
        {
            name: "therapist-onboarding",
            partialize: (state) => ({
                currentStep: state.currentStep,
                completedSteps: state.completedSteps,
                professionalProfile: state.professionalProfile,
                credentials: {
                    licenseNumber: state.credentials.licenseNumber,
                    licenseState: state.credentials.licenseState,
                    // Only persist metadata, not object URLs
                    licenseDocuments: state.credentials.licenseDocuments.map(doc => ({
                        path: doc.path,
                        fileName: doc.fileName,
                        fileSize: doc.fileSize,
                        documentType: doc.documentType,
                        mimeType: doc.mimeType,
                    }))
                },
                availability: state.availability,
                backgroundCheck: {
                    consent: state.backgroundCheck.consent,
                    // Don't persist signature
                },
                payment: {
                    stripeConnected: state.payment.stripeConnected,
                    onboardingComplete: state.payment.onboardingComplete,
                },
            }),
        }
    )
);

export default useOnboardingStore;