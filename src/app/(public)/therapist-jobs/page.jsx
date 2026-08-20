import { MdSearch, MdHandshake, MdPayments } from "react-icons/md";
import { TherapistNavbar } from "@/components/landing/therapist/TherapistNavbar";
import { TherapistLandingHero } from "@/components/landing/therapist/TherapistLandingHero";
import { TherapistJobsPageView } from "@/components/landing/therapist/TherapistJobsPageView";
import { TherapistBenefits } from "@/components/landing/therapist/TherapistBenefits";
import { SupportedDisciplines } from "@/components/landing/therapist/SupportedDisciplines";
import { PlatformFeatures } from "@/components/landing/therapist/PlatformFeatures";
import { TherapistTestimonials } from "@/components/landing/therapist/TherapistTestimonials";
import { TherapistFAQ } from "@/components/landing/therapist/TherapistFAQ";
import { TherapistFinalCTA } from "@/components/landing/therapist/TherapistFinalCTA";
import { HowItWorks } from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import TrustSignals from "@/components/landing/TrustSignals";
import Footer from "@/components/landing/Footer";

const THERAPIST_STEPS = [
    {
        icon: MdSearch,
        title: "Browse Referrals",
        description: "Explore available patient referrals nationwide that match your discipline and preferred service area.",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    },
    {
        icon: MdHandshake,
        title: "Submit an Offer",
        description: "Send your proposed availability and rate directly to the Home Health Agency.",
        image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=400&fit=crop",
    },
    {
        icon: MdPayments,
        title: "Get Booked & Paid",
        description: "Once accepted, manage your visits, communicate securely, and receive payments through RehabTask.",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=400&fit=crop",
    },
];

export default function TherapistJobsPage() {
    return (
        <>
            <TherapistNavbar />
            <TherapistJobsPageView />
            <main>
                <TherapistLandingHero />
                <HowItWorks steps={THERAPIST_STEPS} />
                <Stats />
                <TherapistBenefits />
                <SupportedDisciplines />
                <PlatformFeatures />
                <TherapistTestimonials />
                <TherapistFAQ />
                <TherapistFinalCTA />
                <TrustSignals />
            </main>
            <Footer />
        </>
    );
}