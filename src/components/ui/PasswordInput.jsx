"use client";

import { useState, forwardRef } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import Input from "./Input";

const PasswordInput = forwardRef(({ ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    }

    return (
        <Input
            ref={ref}
            {...props}
            type={showPassword ? "text" : "password"}
            icon={
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-text-muted hover:text-primary transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <MdVisibilityOff size={20} />
                    ) : (
                        <MdVisibility size={20} />
                    )}
                </button>
            }
        />
    )

})

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;