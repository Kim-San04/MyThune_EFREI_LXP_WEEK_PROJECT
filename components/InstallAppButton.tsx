"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { Smartphone, X } from "lucide-react";
import { usePwaInstall } from "@/lib/use-pwa-install";

const APP_URL = "https://project-nnhq8.vercel.app/installer";

interface InstallAppButtonProps {
  className?: string;
}

export default function InstallAppButton({ className }: InstallAppButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { isMobile } = usePwaInstall();

  useEffect(() => {
    QRCode.toDataURL(APP_URL, { width: 200, margin: 1, color: { dark: "#1A1A1A", light: "#FFFFFF" } })
      .then(setQrDataUrl)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleContinue() {
    setOpen(false);
    router.push(isMobile ? "/installer" : "/entrer?mode=register");
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className={className}>
        <span className="sm:hidden">Installer</span>
        <span className="hidden sm:inline">Installer MyThune</span>
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-3 z-50 w-72 glass-strong rounded-2xl p-5 shadow-glass text-center"
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-ink-soft hover:text-ink transition-colors"
            aria-label="Fermer"
          >
            <X size={18} strokeWidth={2.2} />
          </button>

          <p className="font-heading font-bold text-ink mb-1">Installe MyThune</p>
          <p className="text-sm text-ink-mid mb-4">
            Scanne ce QR code avec ton téléphone pour ouvrir l&apos;app et l&apos;ajouter à ton écran d&apos;accueil.
          </p>

          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="QR code vers MyThune" className="mx-auto rounded-xl border border-[#EDE8E0] mb-4" />
          )}

          <button
            onClick={handleContinue}
            className="btn flex items-center justify-center gap-2 w-full rounded-xl bg-coral text-white font-heading font-semibold text-sm px-4 py-2.5 shadow-warm"
          >
            <Smartphone size={16} strokeWidth={2.4} />
            Continuer sur cet appareil
          </button>
        </div>
      )}
    </div>
  );
}
