import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <main className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="flex flex-col items-center gap-8 w-full">
                <ForgotPasswordForm />

                {/* Footer / Support */}
                <footer className="text-center">
                    <p className="text-text-muted text-sm">
                        Need help?{" "}
                        <Link href="/support" className="text-primary hover:underline">
                            Contact Support
                        </Link>
                    </p>
                </footer>
            </div>
        </main>
    )
}