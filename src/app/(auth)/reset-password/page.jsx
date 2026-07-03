export const dynamic = "force-dynamic";
export const metadata = { title: "Reset Password" };

import ResetPasswordForm from "@/components/forms/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <main className="flex-1 flex items-center justify-center p-6">
            <ResetPasswordForm />
        </main>
    );
}