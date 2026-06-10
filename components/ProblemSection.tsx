"use client";

import { useEffect, useRef } from "react";
import { KeyboardOff, FileQuestion, ShieldOff, Check } from "lucide-react";
import { getGsap } from "@/lib/gsap-animations";

const CARDS = [
  {
    icon: KeyboardOff,
    color: "coral" as const,
    title: "Taper chaque dépense ? Non merci.",
    text: "Saisir son kebab, son café, son ticket de bus... Tout le monde commence, personne ne finit. MyThune, t'as même pas à ouvrir l'app.",
  },
  {
    icon: FileQuestion,
    color: "amber" as const,
    title: "« CB LYRECO CORBEIL » — c'est quoi ça ?",
    text: "Les libellés bancaires sont illisibles. L'IA de MyThune les décode instantanément, et tu comprends enfin où part ton argent.",
  },
  {
    icon: ShieldOff,
    color: "violet" as const,
    title: "Pas question de filer mon mot de passe.",
    text: "Aucune connexion à ta banque. Tu uploades juste un PDF depuis ton espace client. Tes identifiants restent chez toi.",
  },
];

const COLOR_MAP = {
  coral: { icon: "text-coral", bg: "bg-coral-light" },
  amber: { icon: "text-amber", bg: "bg-amber-light" },
  violet: { icon: "text-violet", bg: "bg-violet-light" },
};

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const { gsap } = getGsap();
    const ctx = gsap.context(() => {
      gsap.from(".problem-card", {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power3.out",
        clearProps: "transform",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="fonctionnalites" className="relative py-24 px-6 bg-cream-dark/60">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-heading font-bold text-3xl sm:text-4xl text-ink mb-2">
            Pourquoi tu gères pas encore ton budget ?
          </p>
          <p className="text-ink-soft italic text-lg">Soyons honnêtes.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((card) => {
            const Icon = card.icon;
            const colors = COLOR_MAP[card.color];
            return (
              <div
                key={card.title}
                className="problem-card card glass rounded-3xl p-7 flex flex-col"
              >
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center mb-6`}>
                  <Icon size={28} className={colors.icon} strokeWidth={2.2} />
                </div>
                <h3 className="font-heading font-bold text-xl text-ink mb-3 text-balance">
                  {card.title}
                </h3>
                <p className="text-ink-mid leading-relaxed mb-6 flex-1">{card.text}</p>
                <span className="inline-flex w-fit items-center gap-1.5 bg-sage-light text-sage text-xs font-bold px-3 py-1.5 rounded-full">
                  <Check size={14} strokeWidth={3} />
                  Ça te parle ?
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
