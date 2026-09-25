import { TherapistNavbar } from "@/components/landing/therapist/TherapistNavbar";
import { TherapistLandingHero } from "@/components/landing/therapist/TherapistLandingHero";
import { TherapistJobsPageView } from "@/components/landing/therapist/TherapistJobsPageView";
// import { TherapistBenefits } from "@/components/landing/therapist/TherapistBenefits";
// import { SupportedDisciplines } from "@/components/landing/therapist/SupportedDisciplines";
// import { PlatformFeatures } from "@/components/landing/therapist/PlatformFeatures";
// import { TherapistTestimonials } from "@/components/landing/therapist/TherapistTestimonials";
// import { TherapistFAQ } from "@/components/landing/therapist/TherapistFAQ";
// import { HowItWorks } from "@/components/landing/HowItWorks";
// import Stats from "@/components/landing/Stats";
// import TrustSignals from "@/components/landing/TrustSignals";
import { WorkOnYourTerms } from "@/components/landing/therapist/WorkOnYourTerms";
import { YourControlYourChoice } from "@/components/landing/therapist/YourControlYourChoice";
import { SeeTheOpportunity } from "@/components/landing/therapist/SeeTheOpportunity";
import { TherapistHowItWorks } from "@/components/landing/therapist/TherapistHowItWorks";
import { StayInSync } from "@/components/landing/therapist/StayInSync";
import { WorkAndGetPaid } from "@/components/landing/therapist/WorkAndGetPaid";
import { StayInTheLoop } from "@/components/landing/therapist/StayInTheLoop";
import { TherapistFinalCTA } from "@/components/landing/therapist/TherapistFinalCTA";
import Footer from "@/components/landing/Footer";

export default function TherapistJobsPage() {
    return (
        <>
            <TherapistNavbar />
            <TherapistJobsPageView />
            <main>
                <TherapistLandingHero />
                <WorkOnYourTerms />
                <YourControlYourChoice />
                <SeeTheOpportunity />
                <TherapistHowItWorks />
                <StayInSync />
                <WorkAndGetPaid />
                <StayInTheLoop />
                {/* <TherapistFAQ /> */}
                <TherapistFinalCTA />
            </main>
            <Footer />
        </>
    );
}