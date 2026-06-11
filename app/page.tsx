import { Suspense } from "react";
import BackgroundAmbience from "@/components/BackgroundAmbience";
import CoinBackground from "@/components/CoinBackground";
import AppEntryGate from "@/components/AppEntryGate";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import DashboardMockup from "@/components/DashboardMockup";
import ThunieChatSection from "@/components/ThunieChatSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ThunieGuide from "@/components/ThunieGuide";

export default function Home() {
  return (
    <>
      <BackgroundAmbience />
      <CoinBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <ProblemSection />
          <HowItWorksSection />
          <DashboardMockup />
          <ThunieChatSection />
          <CTASection />
        </main>
        <Footer />
      </div>
      <ThunieGuide />
      <Suspense fallback={null}>
        <AppEntryGate />
      </Suspense>
    </>
  );
}
