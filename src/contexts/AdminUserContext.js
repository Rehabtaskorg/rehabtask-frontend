"use client";
import { createContext, useContext } from "react";

const AdminUserContext = createContext(null);

export function AdminUserProvider({ value, children }) {
    return (
        <AdminUserContext.Provider value={value}>
            {children}
        </AdminUserContext.Provider>
    );
}

export function useAdminUser() {
    return useContext(AdminUserContext);
}
