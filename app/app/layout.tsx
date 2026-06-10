import type { Metadata } from "next";
import { Toaster } from "sonner";
import BackgroundAmbience from "@/components/BackgroundAmbience";

export const metadata: Metadata = {
  title: "MyThune — Mon tableau de bord",
  description: "Analyse ton relevé bancaire et discute avec Thunie, ton coach budget IA.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-dark relative">
      <BackgroundAmbience />
      <div className="relative z-10">
        {children}
        <Toaster position="top-right" richColors closeButton theme="light" />
      </div>
    </div>
  );
}
