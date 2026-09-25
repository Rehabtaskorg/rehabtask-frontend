"use client";

import { useCustomerUser } from "@/contexts/CustomerUserContext";
import { APPROVAL_STATUS } from "@/lib/constants";

/**
 * Waiting screen shown while a customer application is under review.
 * Customers who just corrected a rejection get acknowledgement copy so it is
 * clear their resubmission landed, rather than the generic first-submission text.
 */
export function PendingApprovalContent() {
    const customer = useCustomerUser();

    const isResubmitted =
        customer?.approvalStatus === APPROVAL_STATUS.REVIEW && customer?.rejectionReason !== null;

    const heading = isResubmitted ? "Application resubmitted" : "Application Under Review";
    const body = isResubmitted
        ? "Thanks for the update. Our team will take another look within 2–5 business days."
        : "Thank you for completing your application. Our team will review your account within 2–5 business days.";

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-card-light border border-border-light rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
                    <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-text-main mb-2">{heading}</h1>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{body}</p>
                <p className="text-sm text-text-muted leading-relaxed">
                    You&apos;ll receive an email at the address you registered with once a decision has been made.
                </p>
            </div>
        </div>
    );
}