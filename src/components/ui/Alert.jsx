"use client";
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from "react-icons/md";

const Alert = ({ type = "info", message, onClose, className = "" }) => {
    const styles = {
        success: {
            container: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
            text: "text-green-800 dark:text-green-200",
            icon: <MdCheckCircle className="text-green-500 text-xl shrink-0" />,
        },
        error: {
            container: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
            text: "text-red-800 dark:text-red-200",
            icon: <MdError className="text-red-500 text-xl shrink-0" />,
        },
        warning: {
            container: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
            text: "text-yellow-800 dark:text-yellow-200",
            icon: <MdWarning className="text-yellow-500 text-xl shrink-0" />,
        },
        info: {
            container: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
            text: "text-blue-800 dark:text-blue-200",
            icon: <MdInfo className="text-blue-500 text-xl shrink-0" />,
        }
    };

    const style = styles[type] || styles.info;

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${style.container} ${className}`}
            role="alert"
        >
            {style.icon}
            <p className={`flex-1 text-sm leading-relaxed ${style.text}`}>
                {message}
            </p>
            {onClose && (
                <button
                    onClick={onClose}
                    className={`${style.text} hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent rounded`}
                    aria-label="Close alert"
                >
                    <MdClose className="text-xl" />
                </button>
            )}
        </div>
    )
}

export default Alert;