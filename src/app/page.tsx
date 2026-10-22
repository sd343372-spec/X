import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ValueProps } from "@/components/ValueProps";
import { HowItWorks } from "@/components/HowItWorks";
import { UseCases } from "@/components/UseCases";
import { DeveloperSection } from "@/components/DeveloperSection";
import { ProviderSection } from "@/components/ProviderSection";
import { TrustSection } from "@/components/TrustSection";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ValueProps />
        <HowItWorks />
        <UseCases />
        <DeveloperSection />
        <ProviderSection />
        <TrustSection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
