import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedTherapists from "@/components/landing/FeaturedTherapists";
import Stats from "@/components/landing/Stats";
import ForTherapists from "@/components/landing/ForTherapists";
import TrustSignals from "@/components/landing/TrustSignals";
import Footer from "@/components/landing/Footer";
import { montserrat } from "@/lib/fonts";

export const metadata = {
    title: "RehabTask — Find Licensed Rehabilitation Therapists",
    description: "Connect with verified Physical Therapists, Occupational Therapists, and Speech-Language Pathologists for home health rehabilitation services.",
};

export default function LandingPage() {
    return (
        <div className={montserrat.className}>
            <Navbar />
            <main>
                <Hero />
                <HowItWorks />
                <FeaturedTherapists />
                <Stats />
                <ForTherapists />
                <TrustSignals />
            </main>
            <Footer />
        </div>
    );
}
