export const metadata = { title: "Password Reset Successful" };

import PasswordResetSuccess from "@/components/shared/PasswordResetSuccess";

export default function ResetPasswordSuccessPage() {
    return (
        <main className="grow flex items-center justify-center p-6 bg-background-light ">
            <PasswordResetSuccess />
        </main>
    )
}