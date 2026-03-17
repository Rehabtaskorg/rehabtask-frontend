"use client";
import { createContext, useContext } from "react";

const TherapistAccessContext = createContext({
    approvalStatus: null,
    onboardingComplete: false,
    onboardingStep: 1,
    canAccessMarketplace: false,
    canEditPersonalInfo: false,
    canEditCredentials: false,
    isFullyApproved: false,
});

export function TherapistAccessProvider({ value, children }) {
    return (
        <TherapistAccessContext.Provider value={value}>
            {children}
        </TherapistAccessContext.Provider>
    );
}

export function useTherapistAccess() {
    return useContext(TherapistAccessContext);
}