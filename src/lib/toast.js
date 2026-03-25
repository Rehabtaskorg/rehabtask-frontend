import { toast } from "react-toastify";

/**
 * Centralized toast notification utility.
 *
 * Usage:
 *   import { showToast } from "@/lib/toast";
 *   showToast.error("Something went wrong");
 *   showToast.success("Booking confirmed!");
 *   showToast.warning("Your session is expiring soon");
 *   showToast.info("Payment is being processed...");
 */

const defaults = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
};

export const showToast = {
    success: (message, options = {}) =>
        toast.success(message, { ...defaults, ...options }),

    error: (message, options = {}) =>
        toast.error(message, { ...defaults, autoClose: 7000, ...options }),

    warning: (message, options = {}) =>
        toast.warning(message, { ...defaults, autoClose: 6000, ...options }),

    info: (message, options = {}) =>
        toast.info(message, { ...defaults, ...options }),
};
