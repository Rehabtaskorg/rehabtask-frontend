"use client";

import { useState } from "react";
import FadeIn from "@/components/ui/FadeIn";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

const FAQS = [
    {
        question: "Is RehabTask free to join?",
        answer: "Yes — creating a therapist account is completely free. You can browse open referrals, set up your profile, and submit offers at no cost. Premium subscription plans are available for therapists who want additional features and priority placement.",
    },
    {
        question: "How do I receive referrals?",
        answer: "Once your profile is complete and your credentials are verified, you can browse open referrals from Home Health Agencies in your area. You'll receive notifications when new referrals matching your discipline and location are posted.",
    },
    {
        question: "Can I choose which referrals to accept?",
        answer: "Absolutely. You are in full control of which referrals you pursue. Browse available listings, review the case details, and submit offers only for the opportunities that fit your schedule, specialty, and preferred rate.",
    },
    {
        question: "How do payments work?",
        answer: "Payments are processed securely through RehabTask using Stripe. Once a visit is confirmed and completed, your payout is initiated automatically. You can track your earnings in real time from your Earnings Dashboard.",
    },
    {
        question: "How do I get paid?",
        answer: "Payouts are sent directly to your bank account via Stripe Connect. You'll need to complete a one-time Stripe onboarding to link your bank details. After that, payments are deposited automatically following each confirmed visit.",
    },
    {
        question: "What subscription plans are available?",
        answer: "RehabTask offers a free tier to get you started, plus paid plans with higher referral limits, priority visibility, and advanced scheduling tools. You can view and compare all plans from your account settings after signing up.",
    },
    {
        question: "Do I need malpractice insurance?",
        answer: "Yes. All therapists on RehabTask are required to carry active professional liability (malpractice) insurance. You will be asked to upload proof of coverage during the credential verification step of onboarding.",
    },
    {
        question: "How do I become verified?",
        answer: "After creating your account, you'll complete a credential verification process that includes uploading your active state license, proof of malpractice insurance, and any other required documentation. Most verifications are completed within 1–2 business days.",
    },
    {
        question: "Which states are supported?",
        answer: "RehabTask is currently available across the United States. Availability of referrals varies by state and discipline — browse the open referral marketplace to see listings in your area.",
    },
];

/**
 * Accordion FAQ section for the therapist landing page.
 * Keyboard accessible — open/close on Enter and Space.
 */
export function TherapistFAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const handleToggle = (index) => {
        setOpenIndex((prev) => (prev === index ? null : index));
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle(index);
        }
    };

    return (
        <section className="py-20 bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <FadeIn className="text-center mb-14">
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold" style={{ color: "#2EC4B6" }}>
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-3 text-gray-500">
                        Everything you need to know about joining RehabTask as a therapist.
                    </p>
                </FadeIn>

                <div className="space-y-3">
                    {FAQS.map((faq, i) => (
                        <FadeIn key={faq.question} delay={i * 0.04}>
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => handleToggle(i)}
                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                    aria-expanded={openIndex === i}
                                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-sm font-semibold text-gray-900">{faq.question}</span>
                                    {openIndex === i
                                        ? <MdExpandLess className="text-xl text-primary shrink-0" />
                                        : <MdExpandMore className="text-xl text-gray-400 shrink-0" />
                                    }
                                </button>
                                {openIndex === i && (
                                    <div className="px-6 pb-5 bg-white">
                                        <p className="text-sm text-gray-500 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
}