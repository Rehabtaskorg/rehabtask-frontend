"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
                toastClassName="!bg-card-light dark:!bg-card-dark !text-text-main dark:!text-white !border !border-border-light dark:!border-border-dark !rounded-xl !shadow-lg"
                bodyClassName="!text-sm !font-medium"
                progressClassName="!bg-primary"
            />
        </>
    );
}
