"use client";

import { createContext, useContext } from "react";

/**
 * @typedef {{ customerType: string|null, onboardingComplete: boolean, onboardingStep: number, approvalStatus: string|null, rejectionReason: string|null, canAccessMarketplace: boolean }} CustomerUser
 */

const CustomerUserContext = createContext(null);

/**
 * @param {{ value: CustomerUser, children: React.ReactNode }} props
 */
export function CustomerUserProvider({ value, children }) {
    return <CustomerUserContext.Provider value={value}>{children}</CustomerUserContext.Provider>;
}

/** @returns {CustomerUser} */
export function useCustomerUser() {
    return useContext(CustomerUserContext);
}
