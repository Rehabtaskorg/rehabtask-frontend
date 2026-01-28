export default function LoginLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </div>
    );
}
