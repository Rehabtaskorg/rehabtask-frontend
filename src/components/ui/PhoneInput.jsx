"use client";
import React from "react";
import PhoneInputWithCountry from "react-phone-number-input/react-hook-form";
import "react-phone-number-input/style.css";

const PhoneInput = React.forwardRef(({ label, error, required, control, name = "phone",
    ...props
}, ref) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-text-main ">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <PhoneInputWithCountry
                name={name}
                control={control}
                country="US"
                defaultCountry="US"
                countries={["US"]}
                international={false}
                withCountryCallingCode
                className={`
                    flex h-12 w-full items-center gap-2 rounded-xl border px-4
                    ${error
                        ? 'border-red-500 focus-within:border-red-500'
                        : 'border-border-subtle  focus-within:border-primary-base '
                    }
                    bg-white 
                    transition-colors
                    [&_.PhoneInputInput]:flex-1
                    [&_.PhoneInputInput]:bg-transparent
                    [&_.PhoneInputInput]:text-text-main
                    [&_.PhoneInputInput]:
                    [&_.PhoneInputInput]:outline-none
                    [&_.PhoneInputInput]:placeholder:text-text-muted
                    [&_.PhoneInputCountry]:mr-2
                `}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
});

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;