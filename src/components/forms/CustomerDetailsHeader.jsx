"use client";

import { MdArrowBack } from "react-icons/md";
import Alert from "@/components/ui/Alert";
import { CUSTOMER_TYPES } from "@/lib/constants";

const TYPE_DESCRIPTIONS = {
    [CUSTOMER_TYPES.AGENCY]: "a Home Health Agency",
    [CUSTOMER_TYPES.INDIVIDUAL]: "an Individual Patient",
};

/**
 * @param {object} props
 * @param {string} props.customerType - Validated customer type, one of CUSTOMER_TYPES
 * @param {string | null} props.error - Registration error message to surface
 * @param {string | null} props.success - Registration success message to surface
 * @param {() => void} props.onClearMessages - Dismisses the visible alert
 * @param {() => void} props.onChangeType - Returns the user to the type chooser
 * @returns {JSX.Element}
 */
export const CustomerDetailsHeader = ({ customerType, error, success, onClearMessages, onChangeType }) => (
    <>
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Step 2 of 2</p>
        <h2 className="text-text-main text-4xl font-black leading-tight tracking-[-0.033em] mt-2">
            Create Your Account
        </h2>
        <p className="text-text-muted text-base font-normal leading-normal mt-2">
            Registering as {TYPE_DESCRIPTIONS[customerType]}
        </p>

        <button
            type="button"
            onClick={onChangeType}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
            <MdArrowBack className="text-base" aria-hidden="true" />
            Change type
        </button>

        {error && (
            <div className="mt-6">
                <Alert type="error" message={error} onClose={onClearMessages} />
            </div>
        )}

        {success && (
            <div className="mt-6">
                <Alert type="success" message={success} onClose={onClearMessages} />
            </div>
        )}
    </>
);
