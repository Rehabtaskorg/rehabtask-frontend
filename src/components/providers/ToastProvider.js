"use client";

import { ToastContainer } from "react-toastify";

export default function ToastProvider({ children }) {
    return (
        <>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                limit={3}
                theme="colored"
            />
        </>
    );
}
