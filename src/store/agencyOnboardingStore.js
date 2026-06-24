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

            /** Uploaded agency documents (Step 3). Each entry mirrors the upload API response shape. */
            documents: [],

            setCurrentStep: (step) => set({ currentStep: step }),

            markStepComplete: (step) =>
                set((state) => ({
                    completedSteps: [...new Set([...state.completedSteps, step])],
                })),

            updateBusinessProfile: (data) =>
                set((state) => ({
                    businessProfile: { ...state.businessProfile, ...data },
                })),

            /**
             * Add or replace a document entry keyed by documentType.
             * Replacing ensures each slot holds only the most recent upload.
             * @param {{ id, path, fileName, fileSize, documentType, mimeType }} doc
             */
            addAgencyDocument: (doc) =>
                set((state) => ({
                    documents: [
                        ...state.documents.filter((d) => d.documentType !== doc.documentType),
                        doc,
                    ],
                })),

            /**
             * Remove a document by its index in the documents array.
             * @param {number} index
             */
            removeAgencyDocument: (index) =>
                set((state) => ({
                    documents: state.documents.filter((_, i) => i !== index),
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
                    documents: [],
                }),
        }),
        {
            name: "agency-onboarding",
            partialize: (state) => ({
                currentStep: state.currentStep,
                completedSteps: state.completedSteps,
                businessProfile: state.businessProfile,
                documents: state.documents,
            }),
        }
    )
);

export default useAgencyOnboardingStore;
