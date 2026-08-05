"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TIME_BLOCK } from "@/lib/validators/onboarding.schema";

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

            personalInfo: {
                dateOfBirth: "",
                phone: "",
                addressLine1: "",
                addressLine2: "",
                city: "",
                state: "",
                zipCode: "",
                latitude: null,
                longitude: null,
                emergencyContactName: "",
                emergencyContactPhone: "",
            },

            professionalProfile: {
                yearsOfExperience: null,
                primaryLicenseType: "",
                specialties: [],
                languages: [],
                certifications: [],
                pastSettings: [],
                populationExperience: [],
                yearsInHomeHealth: null,
                professionalSummary: "",
                profilePhotoUrl: null,
            },

            credentials: {
                licenseNumber: "",
                licenseState: "",
                npiNumber: "",
                additionalLicenseStates: [],
                licenseDocuments: [],
                w9Document: null,
                evaluationRate: null,
                travelFee: null,
            },

            availability: {
                schedule: initialSchedule,
                availableFrom: null,
                caseloadCapacity: null,
                workAreas: [],
            },

            hipaa: {
                attested: false,
                document: null,
            },

            insurance: {
                doesHomeVisits: false,
                documents: [],
            },

            identity: {
                documents: [],
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

            updatePersonalInfo: (data) =>
                set((state) => ({
                    personalInfo: { ...state.personalInfo, ...data },
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

            setW9Document: (doc) =>
                set((state) => ({
                    credentials: { ...state.credentials, w9Document: doc },
                })),

            clearW9Document: () =>
                set((state) => ({
                    credentials: { ...state.credentials, w9Document: null },
                })),

            updateAvailability: (data) =>
                set((state) => ({
                    availability: { ...state.availability, ...data }
                })),

            addWorkArea: (area) =>
                set((state) => ({
                    availability: {
                        ...state.availability,
                        workAreas: [...(state.availability.workAreas || []), area],
                    },
                })),

            updateWorkArea: (index, area) =>
                set((state) => ({
                    availability: {
                        ...state.availability,
                        workAreas: (state.availability.workAreas || []).map((wa, i) =>
                            i === index ? area : wa
                        ),
                    },
                })),

            removeWorkArea: (index) =>
                set((state) => ({
                    availability: {
                        ...state.availability,
                        workAreas: (state.availability.workAreas || []).filter(
                            (_, i) => i !== index
                        ),
                    },
                })),

            updateInsurance: (data) =>
                set((state) => ({
                    insurance: { ...state.insurance, ...data },
                })),

            addInsuranceDocument: (doc) =>
                set((state) => ({
                    insurance: {
                        ...state.insurance,
                        documents: [...state.insurance.documents, doc],
                    },
                })),

            removeInsuranceDocument: (index) =>
                set((state) => ({
                    insurance: {
                        ...state.insurance,
                        documents: state.insurance.documents.filter((_, i) => i !== index),
                    },
                })),

            updateIdentity: (data) =>
                set((state) => ({
                    identity: { ...state.identity, ...data },
                })),

            addIdentityDocument: (doc) =>
                set((state) => ({
                    identity: {
                        ...state.identity,
                        documents: [...state.identity.documents, doc],
                    },
                })),

            removeIdentityDocument: (index) =>
                set((state) => ({
                    identity: {
                        ...state.identity,
                        documents: state.identity.documents.filter((_, i) => i !== index),
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


            updateHipaa: (data) =>
                set((state) => ({
                    hipaa: { ...state.hipaa, ...data },
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
                    personalInfo: state.personalInfo,
                    professionalProfile: state.professionalProfile,
                    credentials: state.credentials,
                    availability: state.availability,
                    insurance: state.insurance,
                    identity: state.identity,
                    hipaa: state.hipaa,
                    payment: state.payment,
                    currentStep: state.currentStep,
                    completedSteps: state.completedSteps,
                };
            },

            isStepCompleted: (step) => {
                const state = get();
                return state.completedSteps.includes(step);
            },

            reset: () =>
                set({
                    currentStep: 1,
                    completedSteps: [],
                    personalInfo: {
                        dateOfBirth: "",
                        phone: "",
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        latitude: null,
                        longitude: null,
                        emergencyContactName: "",
                        emergencyContactPhone: "",
                    },
                    professionalProfile: {
                        yearsOfExperience: null,
                        primaryLicenseType: "",
                        specialties: [],
                        languages: [],
                        certifications: [],
                        pastSettings: [],
                        populationExperience: [],
                        yearsInHomeHealth: null,
                        professionalSummary: "",
                        profilePhotoUrl: null,
                    },
                    credentials: {
                        licenseNumber: "",
                        licenseState: "",
                        npiNumber: "",
                        additionalLicenseStates: [],
                        licenseDocuments: [],
                        w9Document: null,
                        evaluationRate: null,
                        travelFee: null,
                    },
                    availability: {
                        schedule: initialSchedule,
                        availableFrom: null,
                        caseloadCapacity: null,
                        workAreas: [],
                    },
                    hipaa: {
                        attested: false,
                        document: null,
                    },
                    insurance: {
                        doesHomeVisits: false,
                        documents: [],
                    },
                    identity: {
                        documents: [],
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
                personalInfo: state.personalInfo,
                professionalProfile: state.professionalProfile,
                credentials: {
                    licenseNumber: state.credentials.licenseNumber,
                    licenseState: state.credentials.licenseState,
                    npiNumber: state.credentials.npiNumber,
                    additionalLicenseStates: state.credentials.additionalLicenseStates,
                    evaluationRate: state.credentials.evaluationRate,
                    travelFee: state.credentials.travelFee,
                    licenseDocuments: state.credentials.licenseDocuments.map((doc) => ({
                        path: doc.path,
                        fileName: doc.fileName,
                        fileSize: doc.fileSize,
                        documentType: doc.documentType,
                        mimeType: doc.mimeType,
                    })),
                    w9Document: state.credentials.w9Document ? {
                        path: state.credentials.w9Document.path,
                        fileName: state.credentials.w9Document.fileName,
                        fileSize: state.credentials.w9Document.fileSize,
                        documentType: state.credentials.w9Document.documentType,
                        mimeType: state.credentials.w9Document.mimeType,
                    } : null,
                },
                availability: {
                    schedule: state.availability.schedule,
                    availableFrom: state.availability.availableFrom,
                    caseloadCapacity: state.availability.caseloadCapacity,
                    workAreas: state.availability.workAreas,
                },
                insurance: {
                    doesHomeVisits: state.insurance.doesHomeVisits,
                    documents: state.insurance.documents.map((doc) => ({
                        path: doc.path,
                        fileName: doc.fileName,
                        fileSize: doc.fileSize,
                        documentType: doc.documentType,
                        mimeType: doc.mimeType,
                    })),
                },
                identity: {
                    documents: state.identity.documents.map((doc) => ({
                        path: doc.path,
                        fileName: doc.fileName,
                        fileSize: doc.fileSize,
                        documentType: doc.documentType,
                        mimeType: doc.mimeType,
                    })),
                },
                hipaa: {
                    attested: state.hipaa.attested,
                    document: state.hipaa.document ? {
                        path: state.hipaa.document.path,
                        fileName: state.hipaa.document.fileName,
                        fileSize: state.hipaa.document.fileSize,
                        documentType: state.hipaa.document.documentType,
                        mimeType: state.hipaa.document.mimeType,
                    } : null,
                },
                payment: {
                    stripeConnected: state.payment.stripeConnected,
                    onboardingComplete: state.payment.onboardingComplete,
                },
            }),
            merge: (persisted, current) => ({
                ...current,
                ...persisted,
                availability: {
                    ...current.availability,
                    ...(persisted?.availability || {}),
                    workAreas: persisted?.availability?.workAreas || [],
                },
            }),
        }
    )
);

export default useOnboardingStore;