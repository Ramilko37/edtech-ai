import { DemoGenerator } from "@/components/sections/DemoGenerator";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PersonalizationExamples } from "@/components/sections/PersonalizationExamples";
import { PrivacySection } from "@/components/sections/PrivacySection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { UseCases } from "@/components/sections/UseCases";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <PersonalizationExamples />
      <HowItWorks />
      <UseCases />
      <DemoGenerator />
      <PrivacySection />
      <FinalCTA />
    </main>
  );
}
