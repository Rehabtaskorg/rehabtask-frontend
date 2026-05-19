const Button = ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    type = "button",
    className = "",
    ...props
}) => {
    const variants = {
        primary:     "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20   ",
        secondary:   "bg-gray-100 text-text-main hover:bg-gray-200   ",
        outline:     "border-2 border-primary text-primary hover:bg-primary/5   ",
        destructive: "bg-error text-white hover:bg-error/90   ",
        ghost:       "hover:bg-gray-100 text-text-main  ",
    }

    const sizes = {
        sm: "py-2 px-4 text-sm",
        md: "py-3 px-6 text-base",
        lg: "py-4 px-8 text-lg",
    }

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        font-bold rounded-xl
        transition-all transform active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
            {...props}
        >
            {loading ? (
                <>
                    <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span>Processing...</span>
                </>
            ) : (
                children
            )}
        </button>
    )
}

export default Button;