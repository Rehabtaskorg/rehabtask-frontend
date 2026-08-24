export const metadata = { title: "Application Under Review" };

export default function PendingApprovalPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-card-light border border-border-light rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-text-main mb-2">Application Under Review</h1>
                <p className="text-sm text-text-muted leading-relaxed mb-4">
                    Thank you for completing your application. Our team will review your account within <strong>2–5 business days</strong>.
                </p>
                <p className="text-sm text-text-muted leading-relaxed">
                    You&apos;ll receive an email at the address you registered with once a decision has been made.
                </p>
            </div>
        </div>
    );
}
