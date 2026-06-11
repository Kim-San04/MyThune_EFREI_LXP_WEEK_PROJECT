"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Download, Plus, Share, SquarePlus } from "lucide-react";
import ThunieFox from "@/components/ThunieFox";
import BackgroundAmbience from "@/components/BackgroundAmbience";
import { usePwaInstall } from "@/lib/use-pwa-install";

export default function InstallerPage() {
  const router = useRouter();
  const { canInstall, isIOS, isStandalone, promptInstall } = usePwaInstall();

  function handleContinue() {
    router.push("/");
  }

  async function handleInstall() {
    await promptInstall();
  }

  return (
    <>
      <BackgroundAmbience />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12 safe-top safe-bottom">
        <div className="glass-strong rounded-3xl p-6 sm:p-8 w-full max-w-md text-center">
          <ThunieFox className="w-20 h-20 mx-auto mb-4 animate-float" />
          <h1 className="font-heading font-extrabold text-2xl text-ink mb-2">
            Installe MyThune
          </h1>

          {isStandalone ? (
            <p className="text-sm text-ink-mid mb-6">
              C&apos;est déjà fait ! Ouvre MyThune depuis l&apos;icône sur ton écran d&apos;accueil.
            </p>
          ) : isIOS ? (
            <>
              <p className="text-sm text-ink-mid mb-6">
                Ajoute MyThune à ton écran d&apos;accueil pour l&apos;ouvrir comme une vraie application,
                en 2 étapes :
              </p>
              <ol className="text-left space-y-4 mb-6">
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-coral-light text-coral font-heading font-bold text-sm flex items-center justify-center">
                    1
                  </span>
                  <p className="text-sm text-ink-mid pt-0.5 flex items-center gap-1.5 flex-wrap">
                    Appuie sur <Share size={16} strokeWidth={2.4} className="text-coral" /> <span className="font-semibold text-ink">Partager</span> dans la barre de Safari.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-coral-light text-coral font-heading font-bold text-sm flex items-center justify-center">
                    2
                  </span>
                  <p className="text-sm text-ink-mid pt-0.5 flex items-center gap-1.5 flex-wrap">
                    Sélectionne <SquarePlus size={16} strokeWidth={2.4} className="text-coral" /> <span className="font-semibold text-ink">Sur l&apos;écran d&apos;accueil</span>, puis confirme.
                  </p>
                </li>
              </ol>
            </>
          ) : canInstall ? (
            <>
              <p className="text-sm text-ink-mid mb-6">
                Installe MyThune en un clic pour y accéder directement depuis ton écran d&apos;accueil,
                sans passer par le navigateur.
              </p>
              <button
                onClick={handleInstall}
                className="btn flex items-center justify-center gap-2 w-full rounded-xl bg-coral text-white font-heading font-semibold text-sm px-4 py-3 shadow-warm mb-4"
              >
                <Download size={16} strokeWidth={2.4} />
                Installer l&apos;application
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-mid mb-6">
                Ouvre le menu de ton navigateur et choisis <span className="font-semibold text-ink">&quot;Installer l&apos;application&quot;</span> ou{" "}
                <span className="font-semibold text-ink">&quot;Ajouter à l&apos;écran d&apos;accueil&quot;</span> pour profiter de MyThune en plein écran.
              </p>
              <p className="text-xs text-ink-soft mb-6 flex items-center justify-center gap-1.5">
                <Plus size={14} strokeWidth={2.2} />
                L&apos;icône se trouve généralement à côté de la barre d&apos;adresse.
              </p>
            </>
          )}

          <button
            onClick={handleContinue}
            className="btn flex items-center justify-center gap-2 w-full rounded-xl bg-cream-dark text-ink font-heading font-semibold text-sm px-4 py-3 hover:bg-coral-light hover:text-coral transition-colors"
          >
            Revenir vers MyThune
            <ArrowRight size={16} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </>
  );
}
