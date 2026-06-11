import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Nunito } from "next/font/google";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import { VaultProvider } from "@/lib/vault-context";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyThune — Ton argent, enfin facile à comprendre",
  description:
    "Glisse ton relevé PDF. Thunie, ton coach IA, décortique tout en 10 secondes et te dit où va vraiment ta thune. Zéro connexion bancaire, zéro saisie manuelle.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FDFAF5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${jakarta.variable} ${nunito.variable} font-body antialiased bg-cream text-ink`}>
        <SessionProviderWrapper>
          <VaultProvider>{children}</VaultProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
